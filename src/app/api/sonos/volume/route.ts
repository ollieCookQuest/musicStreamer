import { NextRequest, NextResponse } from "next/server";
import { getVolume } from "@/lib/sonos";

export async function GET(request: NextRequest) {
  const groupId = request.nextUrl.searchParams.get("groupId");
  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }

  try {
    const volume = await getVolume(groupId);
    return NextResponse.json(volume);
  } catch (error: any) {
    console.error("Volume API error:", error);
    // If group is gone, return specific error code so client can refresh
    if (error?.errorCode === "ERROR_RESOURCE_GONE") {
      return NextResponse.json({ error: "Group no longer exists", errorCode: "ERROR_RESOURCE_GONE" }, { status: 410 });
    }
    return NextResponse.json({ error: "Failed to fetch volume" }, { status: 500 });
  }
}
