"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Waves, Monitor, MonitorSmartphone, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DeviceType = "theWall" | "theDesk" | null;

export default function SetupPage() {
  const [step, setStep] = useState<"device" | "sonos">("device");
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check if device is already selected
  useEffect(() => {
    const checkDevice = async () => {
      try {
        const res = await fetch("/api/preferences?key=deviceType");
        if (res.ok) {
          const data = await res.json();
          if (data.value) {
            setSelectedDevice(data.value as DeviceType);
            setStep("sonos");
          }
        }
      } catch (error) {
        console.error("Failed to check device preference:", error);
      }
    };
    checkDevice();
  }, []);

  const handleDeviceSelect = async (device: "theWall" | "theDesk") => {
    setSelectedDevice(device);
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "deviceType", value: device }),
      });
      
      if (res.ok) {
        // Add small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        setStep("sonos");
      } else {
        console.error("Failed to save device preference");
      }
    } catch (error) {
      console.error("Error saving device preference:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground transition-colors duration-1000 overflow-hidden relative">
      {/* Background Decor - Subtle gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-15">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-primary blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-foreground blur-[120px] rounded-full opacity-10" />
      </div>

      <div className="w-full max-w-2xl h-full flex flex-col items-center justify-center gap-6 sm:gap-8 text-center relative z-10 py-4">
        {/* Compact Header */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg">
              <span className="font-black text-4xl sm:text-5xl italic leading-none">S</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic uppercase leading-none">Streamer</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold tracking-[0.3em] uppercase opacity-60">Architectural Sound</p>
          </div>
        </div>

        {/* Content Area - Fits within viewport */}
        <AnimatePresence mode="wait">
          {step === "device" ? (
            <motion.div
              key="device"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg glass-light p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl space-y-6"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight italic uppercase leading-none">Select Your Device</h2>
                <p className="text-xs sm:text-sm text-muted-foreground opacity-70">
                  Choose the device configuration for your setup
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeviceSelect("theWall")}
                  disabled={isSaving}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden touch-manipulation",
                    selectedDevice === "theWall"
                      ? "bg-foreground text-background border-foreground shadow-lg"
                      : "bg-background/50 text-foreground border-foreground/20 hover:border-foreground/40 hover:bg-background/80 active:scale-[0.98]",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      selectedDevice === "theWall"
                        ? "bg-background/20"
                        : "bg-foreground/10"
                    )}>
                      <Monitor className={cn(
                        "h-7 w-7 transition-all",
                        selectedDevice === "theWall" ? "text-background" : "text-foreground"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-black uppercase tracking-tight">TheWall</h3>
                    </div>
                    {selectedDevice === "theWall" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-7 w-7 rounded-full bg-background flex items-center justify-center shrink-0"
                      >
                        <Check className="h-4 w-4 text-foreground" />
                      </motion.div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleDeviceSelect("theDesk")}
                  disabled={isSaving}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden touch-manipulation",
                    selectedDevice === "theDesk"
                      ? "bg-foreground text-background border-foreground shadow-lg"
                      : "bg-background/50 text-foreground border-foreground/20 hover:border-foreground/40 hover:bg-background/80 active:scale-[0.98]",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      selectedDevice === "theDesk"
                        ? "bg-background/20"
                        : "bg-foreground/10"
                    )}>
                      <MonitorSmartphone className={cn(
                        "h-7 w-7 transition-all",
                        selectedDevice === "theDesk" ? "text-background" : "text-foreground"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-black uppercase tracking-tight">TheDesk</h3>
                    </div>
                    {selectedDevice === "theDesk" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-7 w-7 rounded-full bg-background flex items-center justify-center shrink-0"
                      >
                        <Check className="h-4 w-4 text-foreground" />
                      </motion.div>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sonos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg glass-light p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl space-y-6"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight italic uppercase leading-none">Establish Link</h2>
                <p className="text-xs sm:text-sm text-muted-foreground opacity-70 px-4">
                  Connect your Sonos account to control your audio environment
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full h-16 rounded-2xl bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-black italic uppercase shadow-lg border-2 border-white/5 touch-manipulation"
                >
                  <Link href="/api/sonos/login">
                    Connect Ecosystem
                  </Link>
                </Button>
                
                <div className="flex items-center justify-center gap-2 py-2">
                  <Waves className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-foreground/20 italic">Secure Sonos Protocol</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
