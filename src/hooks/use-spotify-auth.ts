"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";

// Generate PKCE code verifier and challenge
function generateCodeVerifier(): string {
  const array = new Uint32Array(56 / 2);
  crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substring(1)).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function useSpotifyAuth() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have a token stored
    const token = localStorage.getItem('spotify_access_token');
    
    // Handle callback first
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
      return;
    }
    
    setIsConnected(!!token);
  }, [searchParams]);

  const handleCallback = async (code: string) => {
    const verifier = localStorage.getItem('spotify_code_verifier');
    if (!verifier) return;

    const redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/spotify/callback`
      : 'https://lvh.me:3000/api/spotify/callback';

    try {
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, verifier, redirect_uri: redirectUri }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        localStorage.setItem('spotify_token_expires', String(Date.now() + data.expires_in * 1000));
        setIsConnected(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Token exchange failed:', error);
    }
  };

  const connect = async () => {
    if (!SPOTIFY_CLIENT_ID) {
      alert('Spotify Client ID not configured. Please add NEXT_PUBLIC_SPOTIFY_CLIENT_ID to .env');
      return;
    }

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    
    localStorage.setItem('spotify_code_verifier', verifier);

    const redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/spotify/callback`
      : 'https://lvh.me:3000/api/spotify/callback';
    
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'user-read-private user-read-email user-library-read user-read-recently-played playlist-read-private playlist-read-collaborative user-read-playback-state',
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const disconnect = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires');
    localStorage.removeItem('spotify_code_verifier');
    setIsConnected(false);
  };

  const getToken = async (): Promise<string | null> => {
    const token = localStorage.getItem('spotify_access_token');
    const expires = localStorage.getItem('spotify_token_expires');
    
    if (!token || !expires) return null;
    
    if (Date.now() < parseInt(expires)) {
      return token;
    }

    // Token expired, refresh it
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expires', String(Date.now() + data.expires_in * 1000));
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        return data.access_token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return null;
  };

  return { isConnected, connect, disconnect, getToken };
}
