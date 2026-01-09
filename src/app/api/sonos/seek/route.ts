import { NextRequest, NextResponse } from "next/server";
import { seek } from "@/lib/sonos";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const positionMillis = searchParams.get("positionMillis");

  if (!groupId || !positionMillis) {
    return NextResponse.json({ error: "Missing groupId or positionMillis" }, { status: 400 });
  }

  try {
    await seek(groupId, parseInt(positionMillis));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Seek API error:", error);
    // If group is gone, return specific error code so client can refresh
    if (error?.errorCode === "ERROR_RESOURCE_GONE") {
      return NextResponse.json({ error: "Group no longer exists", errorCode: "ERROR_RESOURCE_GONE" }, { status: 410 });
    }
    return NextResponse.json({ error: "Failed to seek" }, { status: 500 });
  }
}
