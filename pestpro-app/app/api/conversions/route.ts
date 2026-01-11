import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { verifyWebhookSignature } from "@/lib/webhookAuth";
import { z } from "zod";

const ConversionSchema = z.object({
  status: z.string().min(1),
  valueCents: z.number().optional(),
  currency: z.string().default("USD"),

  leadId: z.string().optional(),
  jobId: z.string().optional(),
  invoiceId: z.string().optional(),

  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
  userId: z.string().optional(),

  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  gclid: z.string().optional(),
  msclkid: z.string().optional(),

  payload: z.record(z.any()).default({})
});

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.conversions);
    if (rateLimitResponse) {
      logger.warn("Rate limit exceeded for conversions endpoint", {
        ip: req.headers.get("x-forwarded-for")
      });
      return rateLimitResponse;
    }

    // Get webhook secret for verification (if configured)
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookSecret) {
      // Verify webhook signature
      const signature = req.headers.get("x-webhook-signature");
      const timestamp = req.headers.get("x-webhook-timestamp");

      // Get raw body for verification
      const rawBody = await req.text();

      const verification = verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret,
        timestamp
      );

      if (!verification.valid) {
        logger.warn("Webhook verification failed", {
          error: verification.error,
          ip: req.headers.get("x-forwarded-for")
        });

        return NextResponse.json(
          { ok: false, error: "Webhook verification failed" },
          { status: 401 }
        );
      }

      // Parse the body after verification
      var body = JSON.parse(rawBody);
    } else {
      // No webhook verification configured, parse normally
      body = await req.json().catch(() => null);
    }

    if (!body) {
      logger.warn("Invalid JSON in conversion request");
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // Validate conversion data
    const parsed = ConversionSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed for conversion request", {
        errors: parsed.error.flatten()
      });
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Create conversion record
    const conv = await prisma.conversion.create({
      data: {
        status: data.status,
        valueCents: data.valueCents ?? null,
        currency: data.currency,

        leadId: data.leadId ?? null,
        jobId: data.jobId ?? null,
        invoiceId: data.invoiceId ?? null,

        sessionId: data.sessionId ?? null,
        deviceId: data.deviceId ?? null,
        userId: data.userId ?? null,

        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        gclid: data.gclid ?? null,
        msclkid: data.msclkid ?? null,

        payloadJson: data.payload
      }
    });

    // Also emit corresponding event to event stream
    await prisma.event.create({
      data: {
        name: data.status,
        source: "server",
        sessionId: data.sessionId ?? null,
        deviceId: data.deviceId ?? null,
        userId: data.userId ?? null,

        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        referrer: null,
        landingUrl: null,

        gclid: data.gclid ?? null,
        msclkid: data.msclkid ?? null,

        payloadJson: { conversionId: conv.id, ...data.payload },
        consentJson: {
          analytics_storage: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted"
        }
      }
    });

    const duration = Date.now() - startTime;

    logger.logConversion(data.status, conv.id, {
      duration: `${duration}ms`,
      leadId: data.leadId,
      jobId: data.jobId,
      value: data.valueCents
    });

    return NextResponse.json({
      ok: true,
      conversionId: conv.id
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error("Conversions endpoint error", error, {
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
