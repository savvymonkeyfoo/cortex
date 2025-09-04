export type ViewType = "control-centre" | "triage" | "conversations" | "assignments" | "live-assignments" | "assignment-archive" | "roster" | "admin" | 
  "new-chat" | "chat-workspace" | "search-chats" | "supervisor" | "network-troubleshooting" | "network-monitoring" |
  "network-tickets" | "server-monitoring" | "conversation";

export type ColorPalette = "ai-startup" | "professional" | "warm-sunset" | "cool-forest" | 
  "midnight-neon" | "desert-dusk" | "arctic-glow" | "retro-pop" | "moody-earth" | "aurora-borealis" | string;

export type ThemeMode = "light" | "dark" | "system";

export interface CustomPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    background: string;
  };
}

export interface PaletteColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
}

export interface WorkspaceData {
  id: string;
  label: string;
  icon: any;
  color?: string;
}