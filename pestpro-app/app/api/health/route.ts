import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "0.1.0"
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed"
      },
      { status: 503 }
    );
  }
}
