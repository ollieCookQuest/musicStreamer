"use client";

import { useSonos } from "@/components/sonos-provider";
import { useDevice } from "@/components/device-provider";
import { ZoneSelector } from "./dashboard/zone-selector";
import { FavoriteGrid } from "./dashboard/favorite-grid";
import { LibraryPage } from "./dashboard/library-page";
import { SettingsPage } from "./dashboard/settings-page";
import { MiniPlayer } from "./player/mini-player";
import { Settings, Moon, Sun, Menu, X, Command } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { currentGroup, isExpanded, currentPage, setCurrentPage } = useSonos();
  const { deviceType } = useDevice();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Device-specific responsive adjustments
  // Both devices are 1280×800, so we optimize for that resolution
  const isDeviceMode = deviceType !== null;

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to dark mode if no preference saved
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Save theme to localStorage and update DOM when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <div className={cn(
      "flex h-screen bg-background text-foreground transition-colors duration-1000 overflow-hidden font-sans",
      isDeviceMode && "device-responsive"
    )}>
      {/* Subtle Background Textures */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-foreground/3 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {isSidebarOpen && !isExpanded && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 35, stiffness: 250 }}
            className="fixed lg:relative z-50 h-full w-[300px] flex flex-col border-r border-foreground/[0.03]"
          >
            {/* Minimalist Logo */}
            <div className="p-10 pb-6 shrink-0">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg">
                  <Command className="text-background h-5 w-5" />
                </div>
                <span className="text-lg font-black tracking-[0.2em] uppercase italic opacity-90 leading-none">Stream</span>
              </div>
            </div>

            {/* Navigation & Rooms */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-6">
              <ZoneSelector isCollapsed={false} />
            </div>

            {/* Simple Controls Footer */}
            <div className="p-10 shrink-0 space-y-6">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full h-12 rounded-full border border-foreground/[0.05] hover:bg-foreground/[0.03] flex items-center justify-between px-6 transition-all duration-300 group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors">
                  {isDarkMode ? "Night" : "Day"}
                </span>
                <div className="relative h-4 w-4">
                  <Sun className={cn("absolute inset-0 h-4 w-4 transition-all duration-700", isDarkMode ? "scale-0 rotate-90" : "scale-100 rotate-0 text-amber-500")} />
                  <Moon className={cn("absolute inset-0 h-4 w-4 transition-all duration-700", isDarkMode ? "scale-100 rotate-0 text-foreground" : "scale-0 -rotate-90")} />
                </div>
              </button>
              
              <div className="flex justify-center">
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-60 dark:opacity-40 italic">V 1.0 Architectural</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Editorial Header */}
        {!isExpanded && (
          <header className="h-32 px-12 lg:px-20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-10">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="h-10 w-10 rounded-full border border-foreground/[0.05] hover:bg-foreground/[0.03] flex items-center justify-center transition-all group relative overflow-hidden"
              >
                <Menu className={cn("h-4 w-4 transition-transform duration-500", isSidebarOpen ? "translate-y-10 scale-0" : "translate-y-0 scale-100")} />
                <X className={cn("absolute h-4 w-4 transition-transform duration-500", isSidebarOpen ? "translate-y-0 scale-100" : "-translate-y-10 scale-0")} />
              </button>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGroup?.id || "empty"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-0.5"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.6em] text-primary opacity-70 dark:opacity-60">Environment</p>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter italic uppercase leading-none text-foreground">
                    {currentGroup?.name || "Lobby"}
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentPage("Settings")}
                  className={cn(
                    "h-10 w-10 rounded-full border border-foreground/[0.05] hover:bg-foreground/[0.03] flex items-center justify-center transition-all",
                    currentPage === "Settings" ? "text-foreground bg-foreground/[0.05]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Cinematic Gallery Grid */}
        <section className={cn(
          "flex-1 overflow-y-auto no-scrollbar pt-4 pb-48",
          !isExpanded 
            ? (isDeviceMode ? "px-8" : "px-12 lg:px-20")
            : "px-0"
        )}>
          {!isExpanded && (
            <>
              {currentPage === "Feed" && <FavoriteGrid />}
              {currentPage === "Library" && <LibraryPage />}
              {currentPage === "Settings" && <SettingsPage />}
              {currentPage === "Broadcast" && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground uppercase tracking-widest">Broadcast Coming Soon</p>
                </div>
              )}
              {currentPage === "Curated" && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground uppercase tracking-widest">Curated Coming Soon</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Floating Controller Hub */}
        {currentPage !== "Settings" && (
          <div className={cn(
            "absolute bottom-12 left-0 right-0 pointer-events-none",
            isDeviceMode ? "px-8" : "px-12 lg:px-20"
          )}>
            <div className="max-w-6xl mx-auto pointer-events-auto">
              <MiniPlayer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
