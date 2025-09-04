import { ColorPalette, PaletteColors } from "../types/theme";
import { generateBackgroundColor, getContrastColor, hexToRgb } from "./theme";

export const getBuiltInPaletteColors = (palette: ColorPalette): PaletteColors => {
  switch (palette) {
    case "professional":
      return { primary: '#0070AD', secondary: '#00A3E0', accent: '#2E1065', success: '#16a34a' };
    case "warm-sunset":
      return { primary: '#FF6B35', secondary: '#F7931E', accent: '#C1272D', success: '#8BC34A' };
    case "cool-forest":
      return { primary: '#2E7D32', secondary: '#00695C', accent: '#1565C0', success: '#388E3C' };
    case "midnight-neon":
      return { primary: '#0FF4C6', secondary: '#2E2B5F', accent: '#FF007F', success: '#39FF14' };
    case "desert-dusk":
      return { primary: '#E76F51', secondary: '#264653', accent: '#F4A261', success: '#2A9D8F' };
    case "arctic-glow":
      return { primary: '#00B4D8', secondary: '#0077B6', accent: '#90E0EF', success: '#06D6A0' };
    case "retro-pop":
      return { primary: '#FF6B6B', secondary: '#FFD93D', accent: '#6BCB77', success: '#4D96FF' };
    case "moody-earth":
      return { primary: '#5A3E2B', secondary: '#8D99AE', accent: '#D9BF77', success: '#6A994E' };
    case "aurora-borealis":
      return { primary: '#4361EE', secondary: '#7209B7', accent: '#F72585', success: '#4CC9F0' };
    case "ai-startup":
    default:
      return { primary: '#40E0D0', secondary: '#44A08D', accent: '#C2185B', success: '#43A047' };
  }
};

export const applyBuiltInPalette = (palette: ColorPalette, isDark: boolean) => {
  const root = document.documentElement;
  const colors = getBuiltInPaletteColors(palette);

  // Apply base colors
  root.style.setProperty('--ai-primary', colors.primary);
  root.style.setProperty('--ai-secondary', colors.secondary);
  root.style.setProperty('--ai-accent', colors.accent);
  root.style.setProperty('--ai-energy', palette === "ai-startup" ? '#E91E63' : colors.accent);

  // Set accessible text colors
  root.style.setProperty('--ai-primary-foreground', getContrastColor(colors.primary));
  root.style.setProperty('--ai-secondary-foreground', getContrastColor(colors.secondary));
  root.style.setProperty('--ai-accent-foreground', getContrastColor(colors.accent));
  root.style.setProperty('--ai-success-foreground', getContrastColor(colors.success));

  // Generate and apply backgrounds
  const lightBg = getPredefinedLightBackground(palette);
  const darkBg = generateBackgroundColor(colors, true);
  
  root.style.setProperty('--background', isDark ? darkBg : lightBg);
  root.style.setProperty('--background-subtle', isDark ? darkBg : getPredefinedLightBackgroundSubtle(palette));

  // Apply TopBar gradient colors
  applyTopBarGradients(palette, colors);
};

const getPredefinedLightBackground = (palette: ColorPalette): string => {
  switch (palette) {
    case "professional": return '#f7f9fc';
    case "warm-sunset": return '#fefcf3';
    case "cool-forest": return '#f8faf8';
    case "midnight-neon": return '#fbfcfe';
    case "desert-dusk": return '#fdfbf7';
    case "arctic-glow": return '#f8fcfe';
    case "retro-pop": return '#fefef9';
    case "moody-earth": return '#fcfbf9';
    case "aurora-borealis": return '#fdfbfe';
    case "ai-startup":
    default: return '#f8f9fb';
  }
};

const getPredefinedLightBackgroundSubtle = (palette: ColorPalette): string => {
  switch (palette) {
    case "professional": return '#f2f6fa';
    case "warm-sunset": return '#fdf9eb';
    case "cool-forest": return '#f4f7f4';
    case "midnight-neon": return '#f8fafd';
    case "desert-dusk": return '#fcf8f2';
    case "arctic-glow": return '#f4f9fd';
    case "retro-pop": return '#fdfcf4';
    case "moody-earth": return '#faf8f5';
    case "aurora-borealis": return '#fbf8fd';
    case "ai-startup":
    default: return '#f1f3f6';
  }
};

const applyTopBarGradients = (palette: ColorPalette, colors: PaletteColors) => {
  const root = document.documentElement;
  
  switch (palette) {
    case "professional":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#1f0a44');
      break;
    case "warm-sunset":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#a91f24');
      break;
    case "cool-forest":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#0d4c87');
      break;
    case "midnight-neon":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#cc0066');
      break;
    case "desert-dusk":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#c8824e');
      break;
    case "arctic-glow":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#73b3bf');
      break;
    case "retro-pop":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#55a260');
      break;
    case "moody-earth":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#ae9960');
      break;
    case "aurora-borealis":
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', colors.accent);
      root.style.setProperty('--ai-violet-02', '#c41e6a');
      break;
    case "ai-startup":
    default:
      root.style.setProperty('--ai-peacock-01', colors.primary);
      root.style.setProperty('--ai-teal-02', colors.secondary);
      root.style.setProperty('--ai-violet-01', '#E91E63');
      root.style.setProperty('--ai-violet-02', colors.accent);
      break;
  }
};

// Helper to darken colors for gradients
export const darkenColor = (rgb: {r: number, g: number, b: number}, factor: number = 0.8) => {
  return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
};