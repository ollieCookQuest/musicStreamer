import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Delete Spotify account
    await prisma.account.deleteMany({
      where: { service: "spotify" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Disconnect Spotify error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
