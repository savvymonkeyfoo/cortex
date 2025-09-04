import { PaletteColors } from "../types/theme";

// Helper function to convert hex to RGB
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Helper function to convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Helper function to convert HSL to hex
export const hslToHex = (h: number, s: number, l: number) => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Intelligent background color generation for both light and dark modes
export const generateBackgroundColor = (colors: PaletteColors, isDarkMode: boolean = false) => {
  // Convert all colors to HSL to analyze them
  const primaryRgb = hexToRgb(colors.primary);
  const secondaryRgb = hexToRgb(colors.secondary);
  const accentRgb = hexToRgb(colors.accent);
  
  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const secondaryHsl = rgbToHsl(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);

  // Calculate average hue, weighted towards primary and secondary
  const avgHue = (primaryHsl.h * 0.4 + secondaryHsl.h * 0.4 + accentHsl.h * 0.2) % 360;

  // Determine color temperature for background selection
  const isWarm = (avgHue >= 0 && avgHue < 60) || (avgHue >= 300 && avgHue < 360); // Reds, oranges, magentas
  const isCool = avgHue >= 180 && avgHue < 300; // Blues, cyans, purples
  const isGreen = avgHue >= 60 && avgHue < 180; // Greens, yellows

  // Generate appropriate background color
  let backgroundHue = avgHue;
  let backgroundSaturation, backgroundLightness;

  if (isDarkMode) {
    // Dark mode backgrounds - much darker but with subtle tint
    backgroundSaturation = 25; // Slightly higher saturation for more noticeable tint in dark mode
    backgroundLightness = 12; // Very dark base

    if (isWarm) {
      backgroundSaturation = 30;
      backgroundLightness = 10; // Slightly darker for warm colors
    } else if (isCool) {
      backgroundSaturation = 20;
      backgroundLightness = 14; // Slightly lighter for cool colors to avoid too much darkness
    } else if (isGreen) {
      backgroundSaturation = 25;
      backgroundLightness = 11;
    }

    // Special handling for very light or saturated palettes in dark mode
    const avgLightness = (primaryHsl.l + secondaryHsl.l + accentHsl.l) / 3;
    if (avgLightness > 60) {
      // For very light palettes, reduce saturation in dark mode
      backgroundSaturation = Math.max(15, backgroundSaturation * 0.7);
      backgroundLightness = 13;
    }
  } else {
    // Light mode backgrounds - very light with subtle tint
    backgroundSaturation = 15; // Very low saturation for subtlety
    backgroundLightness = 96; // Very light

    if (isWarm) {
      backgroundHue = avgHue < 30 ? avgHue + 15 : avgHue; // Shift reds towards orange/yellow
      backgroundSaturation = 20;
      backgroundLightness = 97;
    } else if (isCool) {
      backgroundSaturation = 12;
      backgroundLightness = 96;
    } else if (isGreen) {
      backgroundSaturation = 15;
      backgroundLightness = 97;
    }

    // Special handling for very dark or saturated palettes
    const avgLightness = (primaryHsl.l + secondaryHsl.l + accentHsl.l) / 3;
    if (avgLightness < 40) {
      backgroundLightness = 98;
      backgroundSaturation = Math.max(8, backgroundSaturation * 0.6);
    }
  }

  return hslToHex(backgroundHue, backgroundSaturation, backgroundLightness);
};

// Calculate relative luminance according to WCAG guidelines
export const calculateLuminance = (rgb: {r: number, g: number, b: number}) => {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Determine if we should use white or black text based on background color
export const getContrastColor = (hexColor: string) => {
  const rgb = hexToRgb(hexColor);
  const luminance = calculateLuminance(rgb);
  // Use white text if luminance is below 0.5 (dark background), otherwise use black
  return luminance < 0.5 ? '#ffffff' : '#000000';
};