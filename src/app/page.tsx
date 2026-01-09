import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { Dashboard } from "@/components/dashboard";
import { SpotifyCallbackHandler } from "@/components/spotify-callback-handler";

async function getAccount() {
  return await prisma.account.findFirst({
    where: { service: "sonos" },
  });
}

async function getDevicePreference() {
  const preference = await prisma.preference.findUnique({
    where: { key: "deviceType" },
  });
  return preference?.value || null;
}

export default async function Home() {
  const account = await getAccount();
  const deviceType = await getDevicePreference();

  // Redirect to setup if no device selected or no Sonos account
  if (!deviceType || !account) {
    redirect("/setup");
  }

  return (
    <>
      <Suspense fallback={null}>
        <SpotifyCallbackHandler />
      </Suspense>
      <Dashboard />
    </>
  );
}
