import { NextRequest, NextResponse } from "next/server";
import { getPlayerVolume, setPlayerVolume } from "@/lib/sonos";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("playerId");
  if (!playerId) {
    return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
  }

  try {
    const volume = await getPlayerVolume(playerId);
    return NextResponse.json(volume);
  } catch (error: any) {
    console.error("Player volume API error:", error);
    if (error?.errorCode === "ERROR_RESOURCE_GONE") {
      return NextResponse.json({ error: "Player no longer exists", errorCode: "ERROR_RESOURCE_GONE" }, { status: 410 });
    }
    return NextResponse.json({ error: "Failed to fetch player volume" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");
  const volume = searchParams.get("volume");

  if (!playerId || !volume) {
    return NextResponse.json({ error: "Missing playerId or volume" }, { status: 400 });
  }

  try {
    await setPlayerVolume(playerId, parseInt(volume));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Player volume API error:", error);
    if (error?.errorCode === "ERROR_RESOURCE_GONE") {
      return NextResponse.json({ error: "Player no longer exists", errorCode: "ERROR_RESOURCE_GONE" }, { status: 410 });
    }
    return NextResponse.json({ error: "Failed to set player volume" }, { status: 500 });
  }
}
