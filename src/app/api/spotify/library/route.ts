import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getSpotifyToken() {
  const account = await prisma.account.findFirst({
    where: { service: "spotify" },
  });

  if (!account) {
    throw new Error("Spotify not connected");
  }

  // Check if token needs refresh
  if (account.expiresAt.getTime() <= Date.now() + 60000) {
    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Spotify token");
    }

    const data = await response.json();

    await prisma.account.update({
      where: { id: account.id },
      data: {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
        refreshToken: data.refresh_token || account.refreshToken,
      },
    });

    return data.access_token;
  }

  return account.accessToken;
}

async function spotifyRequest(endpoint: string) {
  const token = await getSpotifyToken();
  
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify API error: ${error}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "playlists", "recent", "library", "search"
  const query = searchParams.get("q");

  try {
    if (type === "playlists") {
      const data = await spotifyRequest("/me/playlists?limit=50");
      return NextResponse.json({
        items: data.items.map((playlist: any) => ({
          id: { objectId: playlist.uri, serviceId: "9", accountId: "sn_2" },
          name: playlist.name,
          imageUrl: playlist.images?.[0]?.url,
          images: playlist.images,
          type: "playlist",
          _objectType: "container",
          description: `${playlist.tracks.total} tracks`,
        })),
      });
    }

    if (type === "recent") {
      const data = await spotifyRequest("/me/player/recently-played?limit=50");
      return NextResponse.json({
        items: data.items.map((item: any) => ({
          id: { objectId: item.track.uri, serviceId: "9", accountId: "sn_2" },
          name: item.track.name,
          imageUrl: item.track.album?.images?.[0]?.url,
          images: item.track.album?.images,
          type: "track",
          _objectType: "track",
          artist: { name: item.track.artists.map((a: any) => a.name).join(", ") },
          playedAt: item.played_at,
        })),
      });
    }

    if (type === "library") {
      const data = await spotifyRequest("/me/tracks?limit=50");
      return NextResponse.json({
        items: data.items.map((item: any) => ({
          id: { objectId: item.track.uri, serviceId: "9", accountId: "sn_2" },
          name: item.track.name,
          imageUrl: item.track.album?.images?.[0]?.url,
          images: item.track.album?.images,
          type: "track",
          _objectType: "track",
          artist: { name: item.track.artists.map((a: any) => a.name).join(", ") },
        })),
      });
    }

    if (type === "search" && query) {
      const data = await spotifyRequest(`/search?q=${encodeURIComponent(query)}&type=track,album,playlist,artist&limit=50`);
      const items = [
        ...(data.tracks?.items || []).map((track: any) => ({
          id: { objectId: track.uri, serviceId: "9", accountId: "sn_2" },
          name: track.name,
          imageUrl: track.album?.images?.[0]?.url,
          type: "track",
          _objectType: "track",
          artist: { name: track.artists.map((a: any) => a.name).join(", ") },
        })),
        ...(data.albums?.items || []).map((album: any) => ({
          id: { objectId: album.uri, serviceId: "9", accountId: "sn_2" },
          name: album.name,
          imageUrl: album.images?.[0]?.url,
          type: "album",
          _objectType: "container",
          artist: { name: album.artists.map((a: any) => a.name).join(", ") },
        })),
        ...(data.playlists?.items || []).map((playlist: any) => ({
          id: { objectId: playlist.uri, serviceId: "9", accountId: "sn_2" },
          name: playlist.name,
          imageUrl: playlist.images?.[0]?.url,
          type: "playlist",
          _objectType: "container",
        })),
      ];
      return NextResponse.json({ items });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Spotify API error:", error);
    if (error.message.includes("not connected")) {
      return NextResponse.json({ error: "Spotify not connected", needsAuth: true }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
