import { NextRequest, NextResponse } from "next/server";
import { sendControl, setVolume, loadFavorite, setPlayModes } from "@/lib/sonos";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const command = searchParams.get("command") as any;
  const volume = searchParams.get("volume");
  const favoriteId = searchParams.get("favoriteId");
  const shuffle = searchParams.get("shuffle");
  const repeat = searchParams.get("repeat");

  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }

  try {
    if (command) {
      await sendControl(groupId, command);
    } else if (volume) {
      await setVolume(groupId, parseInt(volume));
    } else if (favoriteId) {
      await loadFavorite(groupId, favoriteId);
      // Start playback immediately after loading the favorite
      await sendControl(groupId, "play");
    } else if (shuffle !== null || repeat !== null) {
      // Get current playback state to preserve the other mode
      const currentPlayback = await fetch(`${request.nextUrl.origin}/api/sonos/playback?groupId=${groupId}`).then(r => r.json()).catch(() => ({}));
      const currentShuffle = shuffle !== null ? shuffle === "true" : (currentPlayback.playModes?.shuffle ?? false);
      const currentRepeat = repeat !== null ? repeat === "true" : (currentPlayback.playModes?.repeat ?? false);
      await setPlayModes(groupId, currentShuffle, currentRepeat);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Control API error:", error);
    // If group is gone, return specific error code so client can refresh
    if (error?.errorCode === "ERROR_RESOURCE_GONE") {
      return NextResponse.json({ error: "Group no longer exists", errorCode: "ERROR_RESOURCE_GONE" }, { status: 410 });
    }
    return NextResponse.json({ error: "Failed to send command" }, { status: 500 });
  }
}
