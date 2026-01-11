import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TrackEventSchema } from "@/lib/eventSchema";
import { forwardQueue } from "@/lib/queue";
import { defaultRouteForEvent } from "@/lib/routing";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.tracking);
    if (rateLimitResponse) {
      logger.warn("Rate limit exceeded for tracking endpoint", {
        ip: req.headers.get("x-forwarded-for")
      });
      return rateLimitResponse;
    }

    // Parse and validate request body
    const raw = await req.json().catch(() => null);
    if (!raw) {
      logger.warn("Invalid JSON in track request");
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const parsed = TrackEventSchema.safeParse(raw);
    if (!parsed.success) {
      logger.warn("Validation failed for track request", {
        errors: parsed.error.flatten()
      });
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;

    // Idempotency: if externalEventId provided, avoid duplicates
    if (body.externalEventId) {
      const existing = await prisma.event.findUnique({
        where: { externalEventId: body.externalEventId }
      });

      if (existing) {
        logger.info("Duplicate event detected", {
          externalEventId: body.externalEventId,
          eventId: existing.id
        });
        return NextResponse.json({
          ok: true,
          id: existing.id,
          deduped: true
        });
      }
    }

    // Create event in database
    const event = await prisma.event.create({
      data: {
        name: body.name,
        source: body.source ?? "web",
        sessionId: body.sessionId ?? null,
        deviceId: body.deviceId ?? null,
        userId: body.userId ?? null,

        utmSource: body.utmSource ?? null,
        utmMedium: body.utmMedium ?? null,
        utmCampaign: body.utmCampaign ?? null,
        utmTerm: body.utmTerm ?? null,
        utmContent: body.utmContent ?? null,
        referrer: body.referrer ?? null,
        landingUrl: body.landingUrl ?? null,

        gclid: body.gclid ?? null,
        gbraid: body.gbraid ?? null,
        wbraid: body.wbraid ?? null,
        msclkid: body.msclkid ?? null,
        fbclid: body.fbclid ?? null,
        ttclid: body.ttclid ?? null,

        externalEventId: body.externalEventId ?? null,

        payloadJson: body.payload ?? {},
        consentJson: body.consent
      }
    });

    // Determine intended destinations
    const intended = defaultRouteForEvent(event.name);

    // Enqueue for reliable forwarding
    await forwardQueue.add(
      "forward",
      { eventId: event.id, intended },
      {
        attempts: 5,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    const duration = Date.now() - startTime;

    logger.logEvent(event.name, event.id, {
      duration: `${duration}ms`,
      source: event.source,
      sessionId: event.sessionId,
      destinationCount: intended.length
    });

    return NextResponse.json({
      ok: true,
      id: event.id,
      intended
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error("Track endpoint error", error, {
      duration: `${duration}ms`
    });

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
