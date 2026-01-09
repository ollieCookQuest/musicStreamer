"use client";

import { useSonos } from "@/components/sonos-provider";
import { useDevice } from "@/components/device-provider";
import { Button } from "@/components/ui/button";
import { Settings, Radio, Check, X, LogOut, RefreshCw, Loader2, Monitor, MonitorSmartphone, Tv, Laptop, RotateCcw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { refreshState } = useSonos();
  const { deviceType, deviceConfig } = useDevice();
  const [sonosConnected, setSonosConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    setChecking(true);
    
    // Check Sonos connection
    try {
      const res = await fetch("/api/sonos/state");
      setSonosConnected(res.ok);
    } catch (error) {
      setSonosConnected(false);
    }
    
    setChecking(false);
  };

  const reconnectSonos = async () => {
    window.location.href = "/api/sonos/login";
  };

  const disconnectSonos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sonos/disconnect", { method: "POST" });
      if (res.ok) {
        setSonosConnected(false);
        await checkConnections();
        // Redirect to setup if disconnected
        window.location.href = "/setup";
      }
    } catch (error) {
      console.error("Failed to disconnect Sonos:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetDevice = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/reset-device", { method: "POST" });
      if (res.ok) {
        // Redirect to setup page for fresh setup
        window.location.href = "/setup";
      } else {
        const errorData = await res.json();
        console.error("Failed to reset device:", errorData);
        alert("Failed to reset device. Please try again.");
        setResetting(false);
        setShowResetConfirm(false);
      }
    } catch (error) {
      console.error("Failed to reset device:", error);
      alert("Failed to reset device. Please try again.");
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Manage your connections</p>
      </div>

      {/* Device Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-foreground/[0.02] border border-foreground/[0.05] p-8 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-foreground/[0.05] flex items-center justify-center relative overflow-hidden">
            {deviceType === "theWall" ? (
              <div className="flex flex-col items-center justify-center">
                {/* Wall-mounted screen representation */}
                <div className="relative">
                  <Tv className="h-8 w-8 text-foreground" />
                  {/* Wall mount brackets */}
                  <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
                    <div className="h-1 w-1 rounded-full bg-foreground/40" />
                    <div className="h-1 w-1 rounded-full bg-foreground/40" />
                  </div>
                </div>
              </div>
            ) : deviceType === "theDesk" ? (
              <div className="flex flex-col items-center justify-center">
                {/* Desk-mounted device representation */}
                <Monitor className="h-6 w-6 text-foreground mb-0.5" />
                {/* Stand/base */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  <div className="h-1 w-3 bg-foreground/30 rounded-sm" />
                  <div className="h-1 w-2 bg-foreground/40 rounded-sm" />
                  <div className="h-1 w-3 bg-foreground/30 rounded-sm" />
                </div>
              </div>
            ) : (
              <Settings className="h-6 w-6 text-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Device</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Your device configuration
            </p>
          </div>
        </div>

        {deviceConfig ? (
          <div className="pt-4 border-t border-foreground/[0.05] space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest">Device Name</span>
              <span className="font-black text-foreground">{deviceConfig.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest">Screen Size</span>
              <span className="font-black text-foreground">{deviceConfig.screenSize}</span>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-foreground/[0.05]">
            <p className="text-xs text-muted-foreground">
              No device configured. Please select a device during setup.
            </p>
          </div>
        )}
      </motion.div>

      {/* Sonos Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-foreground/[0.02] border border-foreground/[0.05] p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-foreground/[0.05] flex items-center justify-center">
              <Radio className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Sonos Account</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                Control your Sonos speakers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sonosConnected ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Connected</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={disconnectSonos}
                  disabled={loading}
                  className="px-6 py-2 rounded-2xl"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={reconnectSonos}
                className="px-6 py-2 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest"
              >
                Connect Sonos
              </Button>
            )}
          </div>
        </div>

        {sonosConnected && (
          <div className="pt-4 border-t border-foreground/[0.05]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest">Status</span>
              <span className="font-black text-foreground">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground uppercase tracking-widest">Last Sync</span>
              <span className="font-black text-foreground">Just now</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reset Device Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-red-500/5 border border-red-500/20 p-8 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <RotateCcw className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-red-500">Reset Device</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Factory reset - removes all configuration
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-red-500/20">
          <p className="text-sm text-muted-foreground mb-4">
            This will remove your device configuration and Sonos account. You will need to set up the device again from scratch.
          </p>
          
          {!showResetConfirm ? (
            <Button
              variant="ghost"
              onClick={() => setShowResetConfirm(true)}
              className="px-6 py-2 rounded-2xl border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Device
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-500 mb-1">Are you sure?</p>
                  <p className="text-xs text-muted-foreground">
                    This action cannot be undone. All device settings and Sonos account will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetting}
                  className="px-6 py-2 rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={resetDevice}
                  disabled={resetting}
                  className="px-6 py-2 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-black uppercase tracking-widest"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Confirm Reset
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={checkConnections}
          className="px-6 py-2 rounded-2xl"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>
    </div>
  );
}
