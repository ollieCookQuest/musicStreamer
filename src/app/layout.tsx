import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SonosProvider } from "@/components/sonos-provider";
import { DeviceProvider } from "@/components/device-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Streamer",
  description: "Modern music streaming dashboard for Sonos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <DeviceProvider>
          <SonosProvider>
            {children}
          </SonosProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
