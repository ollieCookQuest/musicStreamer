import { cn } from "./utils";

type DeviceType = "theWall" | "theDesk" | null;

/**
 * Get responsive classes optimized for 1280×800 landscape displays
 * Both TheWall and TheDesk use the same resolution, but device-specific
 * adjustments can be made via CSS data attributes
 */
export function getDeviceResponsiveClasses(
  deviceType: DeviceType | null,
  options: {
    padding?: "default" | "compact" | "spacious";
    fontSize?: "default" | "compact" | "large";
    spacing?: "default" | "compact" | "spacious";
  } = {}
): string {
  const { padding = "default", fontSize = "default", spacing = "default" } = options;
  
  if (!deviceType) {
    // Default responsive classes for non-device mode
    return "";
  }
  
  // Both devices are 1280×800, so we use the same responsive classes
  const classes: string[] = [];
  
  // Padding adjustments
  if (padding === "compact") {
    classes.push("px-6");
  } else if (padding === "spacious") {
    classes.push("px-10");
  } else {
    classes.push("px-8"); // Default for device mode
  }
  
  // Font size adjustments
  if (fontSize === "compact") {
    classes.push("text-sm");
  } else if (fontSize === "large") {
    classes.push("text-lg");
  }
  
  // Spacing adjustments
  if (spacing === "compact") {
    classes.push("gap-3");
  } else if (spacing === "spacious") {
    classes.push("gap-6");
  }
  
  return cn(classes);
}

/**
 * Check if we're in device mode (TheWall or TheDesk)
 */
export function isDeviceMode(deviceType: DeviceType | null): boolean {
  return deviceType !== null;
}
