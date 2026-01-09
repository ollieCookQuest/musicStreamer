import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/sonos";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    await exchangeCode(code);
    // Redirect back to home after successful login
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
