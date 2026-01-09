import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const preference = await prisma.preference.findUnique({
      where: { key },
    });

    return NextResponse.json({ 
      value: preference?.value || null 
    });
  } catch (error) {
    console.error("Preference API error:", error);
    return NextResponse.json({ error: "Failed to fetch preference" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const preference = await prisma.preference.upsert({
      where: { key },
      update: { value: value || "" },
      create: { key, value: value || "" },
    });

    return NextResponse.json({ success: true, preference });
  } catch (error) {
    console.error("Preference API error:", error);
    return NextResponse.json({ error: "Failed to save preference" }, { status: 500 });
  }
}
