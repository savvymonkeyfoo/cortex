import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Zap, Globe, Database } from "lucide-react";
import { testServerConnectivity, testServerHealth, quickConnectivityTest } from "../utils/server-connectivity";

export function ConnectivityDebugger() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    connectivity?: any;
    health?: any;
    error?: string;
  }>({});

  const runConnectivityTest = async () => {
    setIsRunning(true);
    setResults({});
    
    try {
      console.log('🔍 Running connectivity diagnostics...');
      
      // Run basic connectivity test
      const connectivityResult = await testServerConnectivity();
      console.log('Connectivity result:', connectivityResult);
      
      let healthResult = null;
      if (connectivityResult.isConnected) {
        // Run health test if connectivity works
        healthResult = await testServerHealth();
        console.log('Health result:', healthResult);
      }
      
      setResults({
        connectivity: connectivityResult,
        health: healthResult
      });
      
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    await quickConnectivityTest();
    setIsRunning(false);
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? 
      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isConnected: boolean) => {
    return (
      <Badge variant={isConnected ? "success" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(isConnected)}
        {isConnected ? "Connected" : "Failed"}
      </Badge>
    );
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="h-5 w-5" />
          Network Connectivity Debugger
        </CardTitle>
        <CardDescription className="text-orange-600 dark:text-orange-400">
          Diagnose server connectivity issues and network problems
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runConnectivityTest}
            disabled={isRunning}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isRunning ? "Testing..." : "Run Full Diagnostics"}
          </Button>
          
          <Button 
            onClick={runQuickTest}
            disabled={isRunning}
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Quick Console Test
          </Button>
        </div>

        {results.connectivity && (
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Server Connectivity</span>
                </div>
                {getStatusBadge(results.connectivity.isConnected)}
              </div>
              
              <div className="text-sm space-y-1">
                <div>URL: <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">{results.connectivity.url}</code></div>
                {results.connectivity.responseTime && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Zap className="h-3 w-3" />
                    Response time: {results.connectivity.responseTime}ms
                  </div>
                )}
                <div className="text-muted-foreground">{results.connectivity.message}</div>
                {results.connectivity.error && (
                  <div className="text-red-600 text-xs">Error: {results.connectivity.error}</div>
                )}
              </div>
            </div>

            {results.health && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Health Check</span>
                  </div>
                  {getStatusBadge(results.health.isConnected)}
                </div>
                
                <div className="text-sm space-y-1">
                  {results.health.responseTime && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Zap className="h-3 w-3" />
                      Response time: {results.health.responseTime}ms
                    </div>
                  )}
                  <div className="text-muted-foreground">{results.health.message}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {results.error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Diagnostics Failed</span>
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">{results.error}</div>
          </div>
        )}

        <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
          <div className="font-medium mb-1">Common Issues:</div>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Server not deployed:</strong> The Supabase Edge Function may not be running</li>
            <li><strong>CORS error:</strong> Cross-origin requests are being blocked</li>
            <li><strong>Network timeout:</strong> Server is taking too long to respond</li>
            <li><strong>Invalid API keys:</strong> Authentication is failing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}