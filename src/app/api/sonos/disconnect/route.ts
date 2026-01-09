import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Delete Sonos account
    await prisma.account.deleteMany({
      where: { service: "sonos" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Disconnect Sonos error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
