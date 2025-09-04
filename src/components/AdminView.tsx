import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Sun, Moon, Monitor, Palette, Save, Check, Plus, Trash2, Sparkles } from "lucide-react";
import { BackendStatus } from "./BackendStatus";
import { ConnectivityDebugger } from "./ConnectivityDebugger";

type ColorPalette = "ai-startup" | "professional" | "warm-sunset" | "cool-forest" | 
  "midnight-neon" | "desert-dusk" | "arctic-glow" | "retro-pop" | "moody-earth" | "aurora-borealis" | string;
type ThemeMode = "light" | "dark" | "system";

interface CustomPalette {
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

interface AdminViewProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentPalette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  customPalettes?: CustomPalette[];
  onCustomPaletteAdd?: (palette: CustomPalette) => void;
  onCustomPaletteDelete?: (paletteId: string) => void;
  generateBackgroundColor?: (colors: { primary: string; secondary: string; accent: string; success: string }) => string;
}

const defaultColorPalettes = [
  {
    id: "ai-startup" as ColorPalette,
    name: "AI Startup",
    description: "Modern tech with peacock teal and vibrant accents",
    colors: {
      primary: "#40E0D0",
      secondary: "#44A08D", 
      accent: "#C2185B",
      success: "#43A047",
      background: "#f8f9fb"
    },
    isCustom: false
  },
  {
    id: "professional" as ColorPalette,
    name: "Professional Blue",
    description: "Corporate Capgemini-inspired blues and purples",
    colors: {
      primary: "#0070AD",
      secondary: "#00A3E0",
      accent: "#2E1065", 
      success: "#16a34a",
      background: "#f7f9fc"
    },
    isCustom: false
  },
  {
    id: "warm-sunset" as ColorPalette,
    name: "Warm Sunset",
    description: "Energetic oranges, reds, and warm golden tones",
    colors: {
      primary: "#FF6B35",
      secondary: "#F7931E",
      accent: "#C1272D",
      success: "#8BC34A",
      background: "#fefcf3"
    },
    isCustom: false
  },
  {
    id: "cool-forest" as ColorPalette,
    name: "Cool Forest",
    description: "Natural greens, deep teals, and earth tones",
    colors: {
      primary: "#2E7D32",
      secondary: "#00695C",
      accent: "#1565C0",
      success: "#388E3C",
      background: "#f8faf8"
    },
    isCustom: false
  },
  {
    id: "midnight-neon" as ColorPalette,
    name: "Midnight Neon",
    description: "Cyberpunk-inspired with dark bases and glowing highlights",
    colors: {
      primary: "#0FF4C6",
      secondary: "#2E2B5F",
      accent: "#FF007F",
      success: "#39FF14",
      background: "#fbfcfe"
    },
    isCustom: false
  },
  {
    id: "desert-dusk" as ColorPalette,
    name: "Desert Dusk",
    description: "Warm sandy hues with a calming twilight sky",
    colors: {
      primary: "#E76F51",
      secondary: "#264653",
      accent: "#F4A261",
      success: "#2A9D8F",
      background: "#fdfbf7"
    },
    isCustom: false
  },
  {
    id: "arctic-glow" as ColorPalette,
    name: "Arctic Glow",
    description: "Cool, crisp tones with icy brightness",
    colors: {
      primary: "#00B4D8",
      secondary: "#0077B6",
      accent: "#90E0EF",
      success: "#06D6A0",
      background: "#f8fcfe"
    },
    isCustom: false
  },
  {
    id: "retro-pop" as ColorPalette,
    name: "Retro Pop",
    description: "Playful vintage palette, reminiscent of 80s posters",
    colors: {
      primary: "#FF6B6B",
      secondary: "#FFD93D",
      accent: "#6BCB77",
      success: "#4D96FF",
      background: "#fefef9"
    },
    isCustom: false
  },
  {
    id: "moody-earth" as ColorPalette,
    name: "Moody Earth",
    description: "Grounded tones with natural depth",
    colors: {
      primary: "#5A3E2B",
      secondary: "#8D99AE",
      accent: "#D9BF77",
      success: "#6A994E",
      background: "#fcfbf9"
    },
    isCustom: false
  },
  {
    id: "aurora-borealis" as ColorPalette,
    name: "Aurora Borealis",
    description: "Inspired by the northern lights — dramatic and luminous",
    colors: {
      primary: "#4361EE",
      secondary: "#7209B7",
      accent: "#F72585",
      success: "#4CC9F0",
      background: "#fdfbfe"
    },
    isCustom: false
  }
];

export function AdminView({ 
  currentTheme, 
  onThemeChange, 
  currentPalette, 
  onPaletteChange,
  customPalettes = [],
  onCustomPaletteAdd,
  onCustomPaletteDelete,
  generateBackgroundColor
}: AdminViewProps) {
  const [aiPreferences, setAiPreferences] = useState(
    "Please keep your responses short and concise. Use Australian English spelling and grammar in all communications. Focus on actionable insights and avoid unnecessary technical jargon unless specifically requested."
  );
  const [hasUnsavedTextChanges, setHasUnsavedTextChanges] = useState(false);
  
  // Custom palette creation state
  const [isCreatingPalette, setIsCreatingPalette] = useState(false);
  const [customPaletteName, setCustomPaletteName] = useState("");
  const [customPaletteColors, setCustomPaletteColors] = useState({
    primary: "#40E0D0",
    secondary: "#44A08D",
    accent: "#C2185B",
    success: "#43A047",
    background: "#f8f9fb"
  });
  const [backgroundGenerated, setBackgroundGenerated] = useState(false);

  const initialPreferences = "Please keep your responses short and concise. Use Australian English spelling and grammar in all communications. Focus on actionable insights and avoid unnecessary technical jargon unless specifically requested.";

  useEffect(() => {
    const hasChanges = aiPreferences !== initialPreferences;
    setHasUnsavedTextChanges(hasChanges);
  }, [aiPreferences]);

  // Auto-generate background color when primary colors change
  useEffect(() => {
    if (generateBackgroundColor && (customPaletteColors.primary !== "#40E0D0" || 
        customPaletteColors.secondary !== "#44A08D" || 
        customPaletteColors.accent !== "#C2185B" || 
        customPaletteColors.success !== "#43A047")) {
      const newBackground = generateBackgroundColor({
        primary: customPaletteColors.primary,
        secondary: customPaletteColors.secondary,
        accent: customPaletteColors.accent,
        success: customPaletteColors.success
      });
      setCustomPaletteColors(prev => ({ ...prev, background: newBackground }));
      setBackgroundGenerated(true);
    }
  }, [customPaletteColors.primary, customPaletteColors.secondary, customPaletteColors.accent, customPaletteColors.success, generateBackgroundColor]);

  // Combine default and custom palettes
  const allPalettes = [...defaultColorPalettes, ...customPalettes.map(cp => ({ ...cp, isCustom: true }))];

  const handlePaletteChange = (paletteId: ColorPalette) => {
    onPaletteChange(paletteId);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onThemeChange(theme);
  };

  const handleSaveTextPreferences = () => {
    setHasUnsavedTextChanges(false);
    console.log("AI Preferences saved:", aiPreferences);
  };

  const handleColorChange = (colorKey: keyof typeof customPaletteColors, value: string) => {
    setCustomPaletteColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
    
    // Reset background generated flag if user manually changes background
    if (colorKey === 'background') {
      setBackgroundGenerated(false);
    }
  };

  const handleRegenerateBackground = () => {
    if (generateBackgroundColor) {
      const newBackground = generateBackgroundColor({
        primary: customPaletteColors.primary,
        secondary: customPaletteColors.secondary,
        accent: customPaletteColors.accent,
        success: customPaletteColors.success
      });
      setCustomPaletteColors(prev => ({ ...prev, background: newBackground }));
      setBackgroundGenerated(true);
    }
  };

  const handleCreateCustomPalette = () => {
    if (!customPaletteName.trim()) return;
    
    const newPalette: CustomPalette = {
      id: `custom-${Date.now()}`,
      name: customPaletteName,
      description: "Custom user-created theme",
      colors: customPaletteColors
    };

    if (onCustomPaletteAdd) {
      onCustomPaletteAdd(newPalette);
    }

    // Reset form
    setCustomPaletteName("");
    setCustomPaletteColors({
      primary: "#40E0D0",
      secondary: "#44A08D",
      accent: "#C2185B",
      success: "#43A047",
      background: "#f8f9fb"
    });
    setBackgroundGenerated(false);
    setIsCreatingPalette(false);
  };

  const handleDeleteCustomPalette = (paletteId: string) => {
    if (onCustomPaletteDelete) {
      onCustomPaletteDelete(paletteId);
    }
    
    // If the deleted palette was active, switch to default
    if (currentPalette === paletteId) {
      onPaletteChange("ai-startup");
    }
  };

  const colorDefinitions = [
    { key: "primary" as const, label: "Primary", description: "Main brand color, buttons, links, header gradient" },
    { key: "secondary" as const, label: "Secondary", description: "Navigation highlights, secondary buttons, accent elements" },
    { key: "accent" as const, label: "Accent", description: "Important highlights, status indicators, active states" },
    { key: "success" as const, label: "Success", description: "Success messages, positive indicators, progress bars" },
    { key: "background" as const, label: "Background", description: "Main interface background - intelligently generated" }
  ];

  return (
    <div className="flex-1 min-w-0 h-full w-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl mb-2 text-foreground">Admin Preferences</h1>
        <p className="text-foreground-muted">
          Customize your AI assistance and interface preferences
        </p>
      </div>

      <div className="h-full flex-1 flex flex-col space-y-8">
        {/* Backend Status Section */}
        <BackendStatus />
        
        {/* Network Connectivity Debugger */}
        <ConnectivityDebugger />

        {/* Customization Section */}
        <Card className="bg-card border border-border shadow-card p-6">
          <div className="space-y-4">
            <h2 className="text-lg text-foreground">Customization</h2>
            <div className="space-y-2">
              <Label htmlFor="ai-preferences" className="text-foreground">
                AI Assistant Preferences
              </Label>
              <Textarea
                id="ai-preferences"
                value={aiPreferences}
                onChange={(e) => setAiPreferences(e.target.value)}
                placeholder="Describe how you'd like your AI assistant to behave..."
                className="min-h-[120px] bg-input-background border-input-border text-foreground resize-y"
              />
              <p className="text-xs text-foreground-muted">
                Tell your AI assistant how you prefer to receive responses, including tone, detail level, and any specific requirements.
              </p>
            </div>
            
            {/* Save button for text preferences only */}
            {hasUnsavedTextChanges && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-warning">
                    You have unsaved text preferences
                  </p>
                  <Button
                    onClick={handleSaveTextPreferences}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Text Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Interface Preferences */}
        <Card className="bg-card border border-border shadow-card p-6">
          <div className="space-y-6">
            <h2 className="text-lg text-foreground">Interface Preferences</h2>
            
            {/* Theme Selection */}
            <div className="space-y-4">
              <Label className="text-foreground">Themes</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentPalette === palette.id
                        ? 'border-ai-primary bg-background-elevated'
                        : 'border-border hover:border-border-strong'
                    }`}
                    onClick={() => handlePaletteChange(palette.id)}
                  >
                    {currentPalette === palette.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-ai-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {palette.isCustom && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute bottom-2 right-2 w-6 h-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Custom Theme</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{palette.name}" theme? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCustomPalette(palette.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    <div className="flex flex-col h-full">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-foreground-muted" />
                          <span className="text-sm text-foreground">
                            {palette.name}
                          </span>
                        </div>
                        
                        <p className="text-xs text-foreground-muted">
                          {palette.description}
                        </p>
                      </div>
                      
                      {/* Color Preview - Now showing 5 colors */}
                      <div className="flex gap-2 mt-auto pt-3">
                        {Object.entries(palette.colors).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-5 h-5 rounded-full border border-border-subtle"
                            style={{ backgroundColor: color }}
                            title={key}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Theme Remix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Theme Remix</Label>
                {!isCreatingPalette && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreatingPalette(true)}
                    className="flex items-center gap-2 text-foreground hover:text-accent-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    Create Custom Theme
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-foreground-muted">
                Create your own custom theme. The background color is intelligently generated based on your chosen colors, creating a harmonious palette that complements your brand.
              </p>

              {isCreatingPalette && (
                <Card className="border border-border-strong p-4 bg-background-elevated">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="palette-name" className="text-foreground text-sm">
                        Theme Name
                      </Label>
                      <Input
                        id="palette-name"
                        value={customPaletteName}
                        onChange={(e) => setCustomPaletteName(e.target.value)}
                        placeholder="Enter a name for your custom theme"
                        className="bg-input-background border-input-border"
                      />
                    </div>

                    {/* Color Pickers */}
                    <div className="space-y-4">
                      <Label className="text-foreground text-sm">Color Selection</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {colorDefinitions.map(({ key, label, description }) => (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full border-2 border-border-subtle"
                                style={{ backgroundColor: customPaletteColors[key] }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-foreground text-sm">{label}</Label>
                                  {key === 'background' && backgroundGenerated && (
                                    <div className="flex items-center gap-1 text-xs text-ai-primary">
                                      <Sparkles className="w-3 h-3" />
                                      <span>AI Generated</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-foreground-muted">{description}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={customPaletteColors[key]}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="w-full h-10 rounded border border-border-strong cursor-pointer bg-transparent"
                                disabled={key === 'background' && backgroundGenerated}
                              />
                              {key === 'background' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleRegenerateBackground}
                                  className="px-3 text-xs text-foreground hover:text-accent-foreground"
                                  title="Regenerate background color based on your theme"
                                >
                                  <Sparkles className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Theme Preview</Label>
                      <div className="flex gap-2">
                        {Object.entries(customPaletteColors).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-8 h-8 rounded-full border border-border-subtle"
                            style={{ backgroundColor: color }}
                            title={key}
                          />
                        ))}
                      </div>
                      {backgroundGenerated && (
                        <p className="text-xs text-ai-primary flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Background color intelligently generated to complement your theme
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={handleCreateCustomPalette}
                        disabled={!customPaletteName.trim()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Custom Theme
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreatingPalette(false);
                          setCustomPaletteName("");
                          setCustomPaletteColors({
                            primary: "#40E0D0",
                            secondary: "#44A08D",
                            accent: "#C2185B",
                            success: "#43A047",
                            background: "#f8f9fb"
                          });
                          setBackgroundGenerated(false);
                        }}
                        className="text-foreground hover:text-accent-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Separator />

            {/* Dark Mode Settings */}
            <div className="space-y-4">
              <Label className="text-foreground">Theme Mode</Label>
              <RadioGroup 
                value={currentTheme} 
                onValueChange={(value: ThemeMode) => handleThemeChange(value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="light" id="light" />
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-foreground-muted" />
                    <Label htmlFor="light" className="text-foreground cursor-pointer">
                      Light Mode
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="dark" id="dark" />
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-foreground-muted" />
                    <Label htmlFor="dark" className="text-foreground cursor-pointer">
                      Dark Mode
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="system" id="system" />
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-foreground-muted" />
                    <Label htmlFor="system" className="text-foreground cursor-pointer">
                      System
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              
              <p className="text-xs text-foreground-muted">
                System mode will automatically switch between light and dark themes based on your device's preferences.
              </p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-success flex items-center gap-2">
                <Check className="w-3 h-3" />
                Interface preferences are applied automatically
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}