import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { encryptJson, decryptJson } from "@/lib/crypto";
import { DestinationType } from "@prisma/client";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { z } from "zod";

const DestinationSchema = z.object({
  type: z.nativeEnum(DestinationType),
  name: z.string().min(1),
  isEnabled: z.boolean().default(false),
  config: z.record(z.any()).optional(),
  includeEvents: z.array(z.string()).default([]),
  excludeEvents: z.array(z.string()).default([])
});

export async function GET(req: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.admin);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require admin authentication
    if (!requireAdmin(req)) {
      logger.warn("Unauthorized access attempt to admin destinations", {
        ip: req.headers.get("x-forwarded-for")
      });
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const dests = await prisma.destination.findMany({
      orderBy: { updatedAt: "desc" }
    });

    // Decrypt config for admin UI
    const safe = dests.map(d => ({
      ...d,
      config: d.configEnc ? decryptJson(d.configEnc) : null,
      configEnc: undefined
    }));

    logger.info("Admin destinations retrieved", {
      count: dests.length
    });

    return NextResponse.json({ ok: true, destinations: safe });
  } catch (error: any) {
    logger.error("Admin destinations GET error", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.admin);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require admin authentication
    if (!requireAdmin(req)) {
      logger.warn("Unauthorized access attempt to admin destinations", {
        ip: req.headers.get("x-forwarded-for")
      });
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Validate request
    const parsed = DestinationSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed for destination", {
        errors: parsed.error.flatten()
      });
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Encrypt config if provided
    const configEnc = data.config ? encryptJson(data.config) : null;

    // Upsert destination
    const dest = await prisma.destination.upsert({
      where: {
        type_name: {
          type: data.type,
          name: data.name
        }
      },
      update: {
        isEnabled: data.isEnabled,
        configEnc,
        includeEvents: data.includeEvents,
        excludeEvents: data.excludeEvents
      },
      create: {
        type: data.type,
        name: data.name,
        isEnabled: data.isEnabled,
        configEnc,
        includeEvents: data.includeEvents,
        excludeEvents: data.excludeEvents
      }
    });

    logger.info("Destination created/updated", {
      id: dest.id,
      type: dest.type,
      name: dest.name,
      isEnabled: dest.isEnabled
    });

    return NextResponse.json({ ok: true, destination: dest });
  } catch (error: any) {
    logger.error("Admin destinations POST error", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(req, RATE_LIMITS.admin);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Require admin authentication
    if (!requireAdmin(req)) {
      logger.warn("Unauthorized access attempt to admin destinations", {
        ip: req.headers.get("x-forwarded-for")
      });
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing destination ID" }, { status: 400 });
    }

    await prisma.destination.delete({ where: { id } });

    logger.info("Destination deleted", { id });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    logger.error("Admin destinations DELETE error", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
