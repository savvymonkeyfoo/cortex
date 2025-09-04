import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, RefreshCw, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function BackendStatus() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [assignmentCount, setAssignmentCount] = useState<number | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBackend = async () => {
    setServerStatus('checking');
    setError(null);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;
      
      // Health check
      console.log('Checking backend health...');
      
      // First try a simple status check
      try {
        const statusResponse = await fetch(`${baseUrl}/status`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('Basic status check:', statusData);
        }
      } catch (error) {
        console.log('Basic status check failed:', error);
      }
      
      const healthResponse = await fetch(`${baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
      setHealthData(healthData);

      // Get assignments
      console.log('Fetching assignments...');
      const assignmentsResponse = await fetch(`${baseUrl}/assignments`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      if (!assignmentsResponse.ok) {
        const errorText = await assignmentsResponse.text();
        throw new Error(`Failed to fetch assignments: ${assignmentsResponse.status} ${assignmentsResponse.statusText} - ${errorText}`);
      }
      
      const assignments = await assignmentsResponse.json();
      console.log('Fetched assignments:', assignments);
      setAssignmentCount(assignments.length);
      
      // Count by status
      const counts: Record<string, number> = {};
      assignments.forEach((assignment: any) => {
        counts[assignment.status] = (counts[assignment.status] || 0) + 1;
      });
      setStatusCounts(counts);
      
      setServerStatus('online');
      setLastCheck(new Date());
    } catch (error) {
      console.error('Backend check failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setServerStatus('offline');
      setLastCheck(new Date());
    }
  };

  const seedData = async () => {
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;
      const response = await fetch(`${baseUrl}/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      if (response.ok) {
        console.log('Data seeded successfully');
        // Refresh the status
        checkBackend();
      } else {
        const error = await response.text();
        console.error('Failed to seed data:', error);
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const setupDatabase = async () => {
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;
      const response = await fetch(`${baseUrl}/setup-db`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Database setup completed');
        checkBackend();
      } else {
        console.error('Database setup result:', result);
        setError(result.error || 'Database setup failed');
        
        // If we got SQL instructions, show them to the user
        if (result.instructions) {
          const instructionsWindow = window.open('', '_blank');
          if (instructionsWindow) {
            instructionsWindow.document.write(`
              <html>
                <head><title>Database Setup Instructions</title></head>
                <body style="font-family: monospace; white-space: pre-wrap; padding: 20px;">
${result.instructions}

Instructions:
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the SQL above
4. Run the query
5. Return here and click "Refresh" to verify setup
                </body>
              </html>
            `);
          }
        }
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      setError(error instanceof Error ? error.message : 'Setup request failed');
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const StatusIcon = serverStatus === 'online' ? CheckCircle : 
                   serverStatus === 'offline' ? XCircle : RefreshCw;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backend Status
        </CardTitle>
        <CardDescription>
          Database connection and assignment data status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${
            serverStatus === 'online' ? 'text-green-500' : 
            serverStatus === 'offline' ? 'text-red-500' : 
            'text-gray-500 animate-spin'
          }`} />
          <span className="capitalize">{serverStatus}</span>
          {lastCheck && (
            <span className="text-sm text-muted-foreground ml-auto">
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {assignmentCount !== null && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Total Assignments: {assignmentCount}
            </p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Badge key={status} variant="outline">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {healthData && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Database: <span className="font-mono">{healthData.database}</span></div>
            {healthData.tables && Object.entries(healthData.tables).map(([table, status]) => (
              <div key={table}>
                {table}: <span className="font-mono">{status as string}</span>
              </div>
            ))}
            
            {/* Show helpful message based on database status */}
            {healthData.database === 'not_configured' && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                <div className="font-semibold">Database not configured</div>
                <div>The app is using mock data. Set up Supabase to enable persistence.</div>
              </div>
            )}
            
            {healthData.database === 'mock_mode' && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                <div className="font-semibold">✓ Mock data mode active</div>
                <div>App is running with realistic sample data. All features work normally.</div>
              </div>
            )}
            
            {healthData.tables && Object.values(healthData.tables).some((status: any) => status.includes('error') && !status.includes('missing')) && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
                <div className="font-semibold">Database error</div>
                <div>There's an issue with the database connection. Check the Supabase dashboard.</div>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border">
            <div className="font-semibold">Error:</div>
            <div className="break-words">{error}</div>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkBackend} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={setupDatabase} size="sm" variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Setup DB
          </Button>
          <Button onClick={seedData} size="sm" variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Seed Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}