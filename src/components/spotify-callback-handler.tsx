"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSonos } from "@/components/sonos-provider";

export function SpotifyCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentPage } = useSonos();

  useEffect(() => {
    const spotifyConnected = searchParams.get("spotify_connected");
    const error = searchParams.get("error");

    if (spotifyConnected === "true") {
      // Redirect to Settings page after successful connection
      setCurrentPage("Settings");
      // Remove query params from URL
      router.replace("/");
    } else if (error) {
      // Show error, redirect to Settings
      setCurrentPage("Settings");
      router.replace("/");
    }
  }, [searchParams, router, setCurrentPage]);

  return null;
}
