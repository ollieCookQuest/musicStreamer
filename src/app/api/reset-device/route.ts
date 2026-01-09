import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Delete Sonos account
    await prisma.account.deleteMany({
      where: { service: "sonos" },
    });

    // Delete device preference
    await prisma.preference.deleteMany({
      where: { key: "deviceType" },
    });

    // Delete zone preferences
    await prisma.preference.deleteMany({
      where: { 
        key: {
          in: ["currentZoneId", "selectedZoneIds"]
        }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset device error:", error);
    return NextResponse.json({ error: "Failed to reset device" }, { status: 500 });
  }
}
