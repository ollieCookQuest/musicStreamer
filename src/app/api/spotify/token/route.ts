import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "https://lvh.me:3000/api/spotify/callback";

export async function POST(request: NextRequest) {
  const { code, verifier, redirect_uri } = await request.json();

  if (!code || !verifier) {
    return NextResponse.json({ error: "Missing code or verifier" }, { status: 400 });
  }

  if (!SPOTIFY_CLIENT_ID) {
    return NextResponse.json({ error: "Spotify Client ID not configured" }, { status: 500 });
  }

  // Use redirect_uri from client or fallback to env
  const redirectUri = redirect_uri || SPOTIFY_REDIRECT_URI;

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
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
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Spotify token exchange error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
