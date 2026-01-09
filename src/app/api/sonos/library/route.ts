import { NextRequest, NextResponse } from "next/server";
import { fetchHouseholds, browseMusicService, getMusicServiceAccounts } from "@/lib/sonos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const containerId = searchParams.get("containerId");

  try {
    const householdsData = await fetchHouseholds();
    const households = householdsData.households;
    if (!households || households.length === 0) {
      return NextResponse.json({ error: "No households found" }, { status: 404 });
    }

    const householdId = households[0].id;

    if (!accountId) {
      // Return available music services
      try {
        const accounts = await getMusicServiceAccounts(householdId);
        return NextResponse.json({ services: accounts.musicServiceAccounts || [] });
      } catch (error) {
        // Fallback: extract from favorites/playback
        return NextResponse.json({ services: [] });
      }
    }

    // Get service ID from account
    const accounts = await getMusicServiceAccounts(householdId);
    const account = accounts.musicServiceAccounts?.find((acc: any) => acc.id === accountId);
    const serviceId = account?.serviceId || "9"; // Default to Spotify

    // Browse containers using Sonos API
    const browseResult = await browseMusicService(householdId, serviceId, accountId, containerId || undefined);
    
    return NextResponse.json({
      containers: browseResult.containers || [],
      items: browseResult.items || [],
    });
  } catch (error: any) {
    console.error("Library API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch library", 
      details: error.message 
    }, { status: 500 });
  }
}
