import { NextRequest, NextResponse } from "next/server";
import { playItem, addToFavorites } from "@/lib/sonos";
import { fetchHouseholds } from "@/lib/sonos";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action"); // "play" or "favorite"
  const groupId = searchParams.get("groupId");
  
  try {
    const body = await request.json();
    const { itemId, serviceId, accountId, name } = body;

    if (action === "play") {
      if (!groupId || !itemId || !serviceId || !accountId) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
      }
      await playItem(groupId, itemId, serviceId, accountId, body.playAction || "replace");
      return NextResponse.json({ success: true });
    } else if (action === "favorite") {
      const householdsData = await fetchHouseholds();
      const households = householdsData.households;
      if (!households || households.length === 0) {
        return NextResponse.json({ error: "No households found" }, { status: 404 });
      }
      const householdId = households[0].id;
      if (!itemId || !serviceId || !accountId || !name) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
      }
      await addToFavorites(householdId, itemId, serviceId, accountId, name);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Library action API error:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
