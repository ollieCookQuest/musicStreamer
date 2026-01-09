"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type DeviceType = "theWall" | "theDesk" | null;

interface DeviceContextType {
  deviceType: DeviceType;
  isLoading: boolean;
  deviceConfig: {
    name: string;
    screenSize: string;
    resolution: string;
    orientation: "landscape" | "portrait";
  } | null;
  // Utility function to get device-specific classes
  deviceClass: (classes: string | { [key: string]: string }) => string;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const DEVICE_CONFIGS = {
  theWall: {
    name: "TheWall",
    screenSize: "10.1\"",
    resolution: "1280×800",
    orientation: "landscape" as const,
  },
  theDesk: {
    name: "TheDesk",
    screenSize: "10.1\"",
    resolution: "1280×800",
    orientation: "landscape" as const,
  },
};

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [deviceType, setDeviceType] = useState<DeviceType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDevice = async () => {
      try {
        const res = await fetch("/api/preferences?key=deviceType");
        if (res.ok) {
          const data = await res.json();
          if (data.value && (data.value === "theWall" || data.value === "theDesk")) {
            setDeviceType(data.value);
          }
        }
      } catch (error) {
        console.error("Failed to load device preference:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDevice();
  }, []);

  const deviceConfig = deviceType ? DEVICE_CONFIGS[deviceType] : null;

  // Utility function to get device-specific classes
  const deviceClass = (classes: string | { [key: string]: string }): string => {
    if (!deviceType) return typeof classes === "string" ? classes : "";
    
    if (typeof classes === "string") {
      // If it's a string, return as-is (device-specific overrides can be added via CSS)
      return classes;
    }
    
    // If it's an object, return the class for the current device
    return classes[deviceType] || classes.default || "";
  };

  // Apply device-specific class to html element for CSS targeting
  useEffect(() => {
    if (deviceType) {
      document.documentElement.setAttribute("data-device", deviceType);
    } else {
      document.documentElement.removeAttribute("data-device");
    }
  }, [deviceType]);

  return (
    <DeviceContext.Provider value={{ deviceType, isLoading, deviceConfig, deviceClass }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
}
