// health-check.ts - Utility for testing backend connectivity
import { projectId, publicAnonKey } from './supabase/info';

export interface HealthCheckResult {
  isHealthy: boolean;
  status: string;
  timestamp?: string;
  error?: string;
  responseTime?: number;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;
  const startTime = Date.now();
  
  try {
    console.log('Performing health check...');
    
    // Create a timeout that works across different environments
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read response');
      
      // Provide more specific error messages based on status codes
      let statusMessage = `HTTP ${response.status}`;
      if (response.status === 404) {
        statusMessage = 'Backend service not found - may not be deployed';
      } else if (response.status === 500) {
        statusMessage = 'Backend service error - check server logs';
      } else if (response.status === 503) {
        statusMessage = 'Backend service unavailable - may be starting up';
      }
      
      return {
        isHealthy: false,
        status: statusMessage,
        error: errorText,
        responseTime
      };
    }

    const data = await response.json();
    
    return {
      isHealthy: true,
      status: data.status || 'ok',
      timestamp: data.timestamp,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = 'Unknown error';
    let statusMessage = 'error';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout - backend may be slow or unavailable';
        statusMessage = 'timeout';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error - check internet connection or backend deployment';
        statusMessage = 'network_error';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error - backend configuration issue';
        statusMessage = 'cors_error';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      isHealthy: false,
      status: statusMessage,
      error: errorMessage,
      responseTime
    };
  }
}

// Helper function to get a user-friendly status message
export function getHealthStatusMessage(result: HealthCheckResult): string {
  if (result.isHealthy) {
    return `✅ Backend is healthy (${result.responseTime}ms)`;
  } else {
    return `❌ Backend is unhealthy: ${result.error || result.status}`;
  }
}

// Helper function to run periodic health checks
export function startPeriodicHealthCheck(
  intervalMs: number = 30000,
  callback: (result: HealthCheckResult) => void
): () => void {
  let isActive = true;
  
  const runCheck = async () => {
    if (!isActive) return;
    
    const result = await performHealthCheck();
    callback(result);
    
    if (isActive) {
      setTimeout(runCheck, intervalMs);
    }
  };
  
  // Start first check immediately
  runCheck();
  
  // Return cleanup function
  return () => {
    isActive = false;
  };
}