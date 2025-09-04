import { projectId, publicAnonKey } from './supabase/info';

const SERVER_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;

export interface ServerConnectivityResult {
  isConnected: boolean;
  status?: number;
  message: string;
  error?: string;
  url: string;
  responseTime?: number;
}

export async function testServerConnectivity(): Promise<ServerConnectivityResult> {
  const url = `${SERVER_BASE_URL}/status`;
  const startTime = Date.now();
  
  try {
    console.log('Testing server connectivity to:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    console.log('Server response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        isConnected: false,
        status: response.status,
        message: `Server responded with error: ${response.status} ${response.statusText}`,
        error: errorText,
        url,
        responseTime
      };
    }
    
    const data = await response.json();
    console.log('Server status data:', data);
    
    return {
      isConnected: true,
      status: response.status,
      message: `Server is running: ${data.message || 'OK'}`,
      url,
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Server connectivity test failed:', error);
    
    if (error.name === 'AbortError') {
      return {
        isConnected: false,
        message: 'Server connection timed out (10s)',
        error: 'Request timeout',
        url,
        responseTime
      };
    }
    
    if (error.message.includes('Failed to fetch')) {
      return {
        isConnected: false,
        message: 'Cannot reach server - possibly not deployed or CORS issue',
        error: error.message,
        url,
        responseTime
      };
    }
    
    return {
      isConnected: false,
      message: `Connection failed: ${error.message}`,
      error: error.message,
      url,
      responseTime
    };
  }
}

export async function testServerHealth(): Promise<ServerConnectivityResult> {
  const url = `${SERVER_BASE_URL}/health`;
  const startTime = Date.now();
  
  try {
    console.log('Testing server health at:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for health check
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        isConnected: false,
        status: response.status,
        message: `Health check failed: ${response.status} ${response.statusText}`,
        error: errorText,
        url,
        responseTime
      };
    }
    
    const healthData = await response.json();
    console.log('Server health data:', healthData);
    
    return {
      isConnected: true,
      status: response.status,
      message: `Server health: ${healthData.status} - Database: ${healthData.database}`,
      url,
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Server health test failed:', error);
    
    return {
      isConnected: false,
      message: `Health check failed: ${error.message}`,
      error: error.message,
      url,
      responseTime
    };
  }
}

// Quick inline test function for debugging
export async function quickConnectivityTest(): Promise<void> {
  console.group('🔧 Server Connectivity Test');
  
  const statusTest = await testServerConnectivity();
  console.log('Status Test:', statusTest);
  
  if (statusTest.isConnected) {
    const healthTest = await testServerHealth();
    console.log('Health Test:', healthTest);
  }
  
  console.groupEnd();
}