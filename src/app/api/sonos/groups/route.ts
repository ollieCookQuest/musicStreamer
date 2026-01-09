import { NextRequest, NextResponse } from "next/server";
import { modifyGroupMembers } from "@/lib/sonos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, playerIds } = body;

    if (!groupId || !playerIds || !Array.isArray(playerIds)) {
      return NextResponse.json({ 
        error: "Missing required parameters",
        details: { groupId: !!groupId, playerIds: Array.isArray(playerIds) }
      }, { status: 400 });
    }

    if (playerIds.length === 0) {
      return NextResponse.json({ 
        error: "No player IDs provided",
        details: { groupId, playerIds }
      }, { status: 400 });
    }

    const result = await modifyGroupMembers(groupId, playerIds);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Group modification API error:", error);
    const errorMessage = error?.message || String(error);
    const errorCode = error?.errorCode || "UNKNOWN";
    return NextResponse.json({ 
      error: "Failed to modify group",
      details: errorMessage,
      errorCode,
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }, { status: 500 });
  }
}
