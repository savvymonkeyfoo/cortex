// DevBackendMonitor.tsx - Optional backend monitoring for developers
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { performHealthCheck, type HealthCheckResult } from "../utils/health-check";

export function DevBackendMonitor() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('show-backend-monitor') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkBackend();
      // Check every 30 seconds when visible
      const interval = setInterval(checkBackend, 30000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const checkBackend = async () => {
    setIsLoading(true);
    const healthResult = await performHealthCheck();
    setResult(healthResult);
    setIsLoading(false);
  };

  const handleToggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    localStorage.setItem('show-backend-monitor', newVisibility.toString());
    
    if (newVisibility) {
      checkBackend();
    }
  };

  const handleHide = () => {
    setIsVisible(false);
    localStorage.setItem('show-backend-monitor', 'false');
  };

  // Add global keyboard shortcut to toggle (Ctrl/Cmd + Shift + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        handleToggleVisibility();
        console.log('🔧 Backend monitor toggled:', !isVisible ? 'ON' : 'OFF');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible || !result) {
    return null;
  }

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    return result.isHealthy ? 
      <CheckCircle className="h-4 w-4" /> : 
      <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
    return result.isHealthy ? 
      'border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' :
      'border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
  };

  return (
    <Alert className={`mb-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 flex-1">
          {getStatusIcon()}
          <AlertDescription className="text-xs">
            <strong>Dev Monitor:</strong> {
              isLoading ? 'Checking backend...' :
              result.isHealthy ? `Backend connected (${result.responseTime}ms)` : 
              `Backend unavailable: ${result.error}`
            }
            <div className="text-xs opacity-60 mt-1">
              Press Ctrl+Shift+B to toggle • Console logs available
            </div>
          </AlertDescription>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHide}
          className="text-xs h-6 w-6 p-0"
          title="Hide monitor (Ctrl+Shift+B to show again)"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  );
}

// Export helper function for developers to enable monitoring via console
export function enableBackendMonitor() {
  localStorage.setItem('show-backend-monitor', 'true');
  window.location.reload();
}

// Make it globally available for console use
if (typeof window !== 'undefined') {
  (window as any).enableBackendMonitor = enableBackendMonitor;
}