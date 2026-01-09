import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "https://lvh.me:3000/api/spotify/callback";

export async function GET(request: NextRequest) {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return NextResponse.json({ 
      error: "Spotify credentials not configured",
      message: "Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env"
    }, { status: 500 });
  }

  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-library-read",
    "user-read-recently-played",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-playback-state",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scopes,
    state: "spotify-auth",
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  return NextResponse.json({ authUrl });
}
