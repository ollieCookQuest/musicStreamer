import { NextResponse } from "next/server";
import { fetchHouseholds, fetchGroups, fetchFavorites } from "@/lib/sonos";

export async function GET() {
  try {
    const householdsData = await fetchHouseholds();
    const households = householdsData.households;

    if (!households || households.length === 0) {
      return NextResponse.json({ households: [], groups: [], favorites: [] });
    }

    const householdId = households[0].id; // Use first household for MVP
    
    const [groupsData, favoritesData] = await Promise.all([
      fetchGroups(householdId),
      fetchFavorites(householdId),
    ]);

    return NextResponse.json({
      households,
      groups: groupsData.groups || [],
      favorites: favoritesData.items || [],
    });
  } catch (error) {
    console.error("State API error:", error);
    return NextResponse.json({ error: "Failed to fetch state" }, { status: 500 });
  }
}
