import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json({ error: "Missing refresh_token" }, { status: 400 });
  }

  if (!SPOTIFY_CLIENT_ID) {
    return NextResponse.json({ error: "Spotify Client ID not configured" }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(SPOTIFY_CLIENT_SECRET
          ? { Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}` }
          : {}),
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Spotify token refresh error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
