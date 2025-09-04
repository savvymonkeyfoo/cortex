import { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { LeftNavigation } from "./components/LeftNavigation";
import { ActiveWorkstreams } from "./components/ActiveWorkstreams";
import { NeedsAttention } from "./components/NeedsAttention";
import { RightRail } from "./components/RightRail";
import { TriageView } from "./components/TriageView";
import { ConversationsView } from "./components/ConversationsView";
import { TasksView } from "./components/TasksView";
import { AssignmentArchive } from "./components/AssignmentArchive";
import { RosterView } from "./components/RosterView";
import { AdminView } from "./components/AdminView";
import { Badge } from "./components/ui/badge";
import { ViewType, ColorPalette, ThemeMode, CustomPalette } from "./types/theme";
import { generateBackgroundColor, getContrastColor, hexToRgb } from "./utils/theme";
import { applyBuiltInPalette, darkenColor } from "./utils/colorPalettes";
import { WorkspaceData } from "./types/theme";
import { 
  FileText, 
  Wrench, 
  Network, 
  GitBranch, 
  Building, 
  Linkedin, 
  MessageSquare, 
  Brain, 
  Shield 
} from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("control-centre");
  const [conversationAutonomy, setConversationAutonomy] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [colorPalette, setColorPalette] = useState<ColorPalette>("ai-startup");
  const [customPalettes, setCustomPalettes] = useState<CustomPalette[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isConsultPanelOpen, setIsConsultPanelOpen] = useState(false);

  // Task spaces from LeftNavigation (dynamic database data)
  const [taskSpaces, setTaskSpaces] = useState<any[]>([]);
  const [navigationRefreshTrigger, setNavigationRefreshTrigger] = useState<number>(0);

  // Legacy workspace management for backward compatibility
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([
    { id: "cortex", label: "Cortex", icon: FileText, color: "bg-purple-500" },
    { id: "n8n-assistant", label: "N8N Assistant", icon: Wrench, color: "bg-teal-500" },
    { id: "nbn-amplifier", label: "NBN Amplifier LLM Certification", icon: Network, color: "bg-orange-500" },
    { id: "ap-labs", label: "AP Labs Innovation Playbook", icon: GitBranch, color: "bg-gray-500" },
    { id: "capgemini-admin", label: "Capgemini Admin", icon: Building, color: "bg-blue-500" },
    { id: "linkedin-post", label: "LinkedIn Post Researcher and Writer", icon: Linkedin, color: "bg-red-500" },
    { id: "mlc-prompt", label: "MLC Prompt Writing Assistant", icon: MessageSquare, color: "bg-yellow-500" },
    { id: "aie", label: "AIE", icon: Brain, color: "bg-pink-500" },
    { id: "anz-compliance", label: "ANZ Compliance Confidence Platform", icon: Shield, color: "bg-blue-400" }
  ]);

  const handleTaskSpacesChange = (newTaskSpaces: any[]) => {
    setTaskSpaces(newTaskSpaces);
  };

  // System theme detection
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  useEffect(() => {
    // Check initial system preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPrefersDark(mediaQuery.matches);

      // Listen for changes
      const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const isDark = themeMode === "dark" || (themeMode === "system" && systemPrefersDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, systemPrefersDark]);

  // Function to apply custom palette colors with accessibility and background for both light and dark modes
  const applyCustomPalette = (palette: CustomPalette) => {
    const root = document.documentElement;
    root.style.setProperty('--ai-primary', palette.colors.primary);
    root.style.setProperty('--ai-secondary', palette.colors.secondary);
    root.style.setProperty('--ai-accent', palette.colors.accent);
    root.style.setProperty('--ai-energy', palette.colors.accent);
    
    // Set accessible text colors for each color
    root.style.setProperty('--ai-primary-foreground', getContrastColor(palette.colors.primary));
    root.style.setProperty('--ai-secondary-foreground', getContrastColor(palette.colors.secondary));
    root.style.setProperty('--ai-accent-foreground', getContrastColor(palette.colors.accent));
    root.style.setProperty('--ai-success-foreground', getContrastColor(palette.colors.success));
    
    // Generate both light and dark background colors with tinting
    const lightBackground = palette.colors.background && palette.colors.background !== '#f8f9fb' 
      ? palette.colors.background 
      : generateBackgroundColor(palette.colors, false);
    const darkBackground = generateBackgroundColor(palette.colors, true);
    
    // Apply light mode backgrounds
    root.style.setProperty('--background-light', lightBackground);
    root.style.setProperty('--background-subtle-light', lightBackground);
    
    // Apply dark mode backgrounds
    root.style.setProperty('--background-dark', darkBackground);
    root.style.setProperty('--background-subtle-dark', darkBackground);
    
    // Set current background based on theme
    const isDark = themeMode === "dark" || (themeMode === "system" && systemPrefersDark);
    root.style.setProperty('--background', isDark ? darkBackground : lightBackground);
    root.style.setProperty('--background-subtle', isDark ? darkBackground : lightBackground);
    
    // Generate darker variants for gradients
    const primaryRgb = hexToRgb(palette.colors.primary);
    const accentRgb = hexToRgb(palette.colors.accent);
    
    // TopBar gradient colors
    root.style.setProperty('--ai-peacock-01', palette.colors.primary);
    root.style.setProperty('--ai-teal-02', palette.colors.secondary);
    root.style.setProperty('--ai-violet-01', palette.colors.accent);
    root.style.setProperty('--ai-violet-02', darkenColor(accentRgb, 0.8));
  };

  // Apply color palette with enhanced TopBar support and custom palette handling
  useEffect(() => {
    document.documentElement.setAttribute('data-color-palette', colorPalette);
    
    // Check if it's a custom palette
    const customPalette = customPalettes.find(cp => cp.id === colorPalette);
    if (customPalette) {
      applyCustomPalette(customPalette);
      return;
    }

    // Apply built-in palette
    const isDark = themeMode === "dark" || (themeMode === "system" && systemPrefersDark);
    applyBuiltInPalette(colorPalette, isDark);
  }, [colorPalette, customPalettes, themeMode, systemPrefersDark]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    localStorage.setItem('theme-mode', newTheme);
  };

  const handlePaletteChange = (newPalette: ColorPalette) => {
    setColorPalette(newPalette);
    localStorage.setItem('color-palette', newPalette);
  };

  const handleCustomPaletteAdd = (palette: CustomPalette) => {
    const updatedPalettes = [...customPalettes, palette];
    setCustomPalettes(updatedPalettes);
    localStorage.setItem('custom-palettes', JSON.stringify(updatedPalettes));
    handlePaletteChange(palette.id);
  };

  const handleCustomPaletteDelete = (paletteId: string) => {
    const updatedPalettes = customPalettes.filter(cp => cp.id !== paletteId);
    setCustomPalettes(updatedPalettes);
    localStorage.setItem('custom-palettes', JSON.stringify(updatedPalettes));
  };

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    const savedPalette = localStorage.getItem('color-palette') as ColorPalette;
    const savedCustomPalettes = localStorage.getItem('custom-palettes');
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeMode(savedTheme);
    }
    
    if (savedCustomPalettes) {
      try {
        const parsedPalettes = JSON.parse(savedCustomPalettes) as CustomPalette[];
        setCustomPalettes(parsedPalettes);
      } catch (error) {
        console.error('Failed to parse custom palettes from localStorage:', error);
      }
    }
    
    if (savedPalette) {
      setColorPalette(savedPalette);
    }
  }, []);

  const toggleDarkMode = () => {
    // Legacy function for LeftNavigation - cycles through modes
    const nextMode = themeMode === "light" ? "dark" : themeMode === "dark" ? "system" : "light";
    handleThemeChange(nextMode);
  };

  const handleConversationSelect = (conversationId: string) => {
    console.log('App: Setting active conversation ID to:', conversationId);
    setActiveConversationId(conversationId);
    setCurrentView("conversation");
  };

  const handleConversationNotFound = () => {
    console.log('App: Conversation not found, clearing active conversation and switching to new chat');
    setActiveConversationId(null);
    setCurrentView("new-chat");
  };

  const handleConversationCreated = (conversationId: string) => {
    console.log('App: New conversation created with ID:', conversationId);
    setActiveConversationId(conversationId);
    setCurrentView("conversation");
    
    // Trigger refresh of navigation data to show new chat in Chats section
    setNavigationRefreshTrigger(prev => prev + 1);
  };

  // Helper to determine if we're currently in dark mode
  const isDarkMode = themeMode === "dark" || (themeMode === "system" && systemPrefersDark);

  const renderMainContent = () => {
    switch (currentView) {
      case "triage":
        return <TriageView />;
      case "conversations":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy}
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "assignments":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl mb-4">Assignment Management</h3>
              <p className="text-muted-foreground mb-6">Choose an assignment view from the navigation menu.</p>
            </div>
          </div>
        );
      case "live-assignments":
        return <TasksView />;
      case "assignment-archive":
        return <AssignmentArchive />;
      case "new-chat":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            newChat={true}
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "chat-workspace":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            newChat={true}
            workspaceMode={true}
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "search-chats":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            searchMode={true}
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "supervisor":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            agent="supervisor"
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "network-troubleshooting":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            agent="network-troubleshooting"
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "network-monitoring":
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            agent="network-monitoring"
            onConversationCreated={handleConversationCreated}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "conversation":
        console.log('App: Rendering conversation view with ID:', activeConversationId);
        return (
          <ConversationsView 
            autonomyMode={conversationAutonomy} 
            onAutonomyChange={setConversationAutonomy} 
            conversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
            onConversationNotFound={handleConversationNotFound}
            workspaces={workspaces}
            taskSpaces={taskSpaces}
          />
        );
      case "roster":
        return <RosterView />;
      case "admin":
        return (
          <AdminView
            currentTheme={themeMode}
            onThemeChange={handleThemeChange}
            currentPalette={colorPalette}
            onPaletteChange={handlePaletteChange}
            customPalettes={customPalettes}
            onCustomPaletteAdd={handleCustomPaletteAdd}
            onCustomPaletteDelete={handleCustomPaletteDelete}
            generateBackgroundColor={(colors) => generateBackgroundColor(colors, isDarkMode)}
          />
        );
      case "control-centre":
      default:
        return (
          <div className="space-y-6 max-w-full">
            {/* Needs Attention */}
            <NeedsAttention onConsultPanelChange={setIsConsultPanelOpen} />
            
            {/* Active Workstreams */}
            <ActiveWorkstreams />
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar - Fixed */}
      <TopBar />
      
      {/* Main Layout - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation - Fixed */}
        <LeftNavigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onConversationSelect={handleConversationSelect}
          activeConversationId={activeConversationId}
          workspaces={workspaces}
          onWorkspacesChange={setWorkspaces}
          onTaskSpacesChange={handleTaskSpacesChange}
          refreshTrigger={navigationRefreshTrigger}
        />
        
        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-auto bg-background-subtle">
          <div className="p-6 h-full min-h-0 outline-none">
            {renderMainContent()}
          </div>
        </div>
        
        {/* Right Rail - Fixed, Only show on control centre view when consult panel is not open */}
        {currentView === "control-centre" && !isConsultPanelOpen && <RightRail />}
      </div>
    </div>
  );
}