import { NextRequest, NextResponse } from "next/server";
import { fetchHouseholds, getMusicServiceMetadata } from "@/lib/sonos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const itemId = searchParams.get("itemId");
  const serviceId = searchParams.get("serviceId");

  if (!accountId || !itemId || !serviceId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const householdsData = await fetchHouseholds();
    const households = householdsData.households;
    if (!households || households.length === 0) {
      return NextResponse.json({ error: "No households found" }, { status: 404 });
    }

    const householdId = households[0].id;

    // Get metadata for the item
    const metadata = await getMusicServiceMetadata(householdId, accountId, itemId, serviceId);
    
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Metadata API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch metadata", 
      details: error.message 
    }, { status: 500 });
  }
}
