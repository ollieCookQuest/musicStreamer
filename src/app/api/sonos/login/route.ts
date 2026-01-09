import { redirect } from "next/navigation";
import { getAuthUrl } from "@/lib/sonos";

export async function GET() {
  const url = getAuthUrl();
  redirect(url);
}
