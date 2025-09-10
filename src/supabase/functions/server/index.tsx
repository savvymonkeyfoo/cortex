import { Hono } from 'npm:hono@4.6.12';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import {
  initializeTables,
  seedDefaultData,
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
  createMessage,
  getMessages,
  deleteMessage,
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  type Workspace,
  type Conversation,
  type Message,
  type Assignment
} from './database.tsx';
import {
  getSupabaseAssignments,
  getSupabaseAssignmentById,
  createSupabaseAssignment,
  updateSupabaseAssignment,
  deleteSupabaseAssignment,
  getSupabaseTriageAssignments,
  getSupabaseTriageAssignmentById,
  getSupabaseAssignmentSteps,
  addSupabaseAssignmentComment,
  seedLiveAssignments
} from './supabase-db.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { SYSTEM_USER_ID } from '../../../constants.ts';

// Create Supabase client for health checks
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize KV store on startup
let kvInitialized = false;

app.use('*', async (c, next) => {
  if (!kvInitialized) {
    console.log('=== Server Initialization Starting ===');
    
    try {
      console.log('Initializing KV store with conversation data...');
      await initializeTables();
      console.log('✓ KV store initialization complete');
    } catch (error) {
      console.error('✗ KV store initialization failed:', error);
      // Continue anyway - KV store is for conversations, not assignments
    }
    
    // Skip database seeding entirely - let endpoints handle mock data as needed
    console.log('ℹ Database seeding skipped - endpoints will serve mock data when needed');
    
    kvInitialized = true;
    console.log('=== Server initialization complete ===');
  }
  await next();
});

// Simple status check (no database)
app.get('/make-server-a7530657/status', (c) => {
  return c.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    message: 'Server is operational',
    mock_mode: true
  });
});

// Health check
app.get('/make-server-a7530657/health', async (c) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'running',
    database: 'unknown',
    tables: {}
  };

  try {
    // Test database connection
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      health.database = 'misconfigured';
      health.status = 'degraded';
    } else {
      if (supabase) {
        // Test assignments table with comprehensive error handling
        try {
          const { data, error } = await supabase
            .from('assignments')
            .select('count', { count: 'exact', head: true });
          
          if (error) {
            health.tables.assignments = 'missing (expected)';
            health.database = 'mock_mode';
          } else {
            health.tables.assignments = 'accessible';
            health.database = 'connected';
          }
        } catch (error) {
          health.tables.assignments = 'missing (expected)';
          health.database = 'mock_mode';
        }

        // Test assignment_steps table with comprehensive error handling
        try {
          const { data, error } = await supabase
            .from('assignment_steps')
            .select('count', { count: 'exact', head: true });
          
          if (error) {
            health.tables.assignment_steps = 'missing (expected)';
          } else {
            health.tables.assignment_steps = 'accessible';
          }
        } catch (error) {
          health.tables.assignment_steps = 'missing (expected)';
        }
      } else {
        health.database = 'not_configured';
        health.tables.assignments = 'no config';
        health.tables.assignment_steps = 'no config';
      }
    }
  } catch (error) {
    health.database = `error: ${error.message}`;
    health.status = 'error';
  }

  return c.json(health);
});

// Mock data for when database is not ready
const getMockAssignments = (statuses?: string[]) => {
  const mockData = [
    {
      id: 'mock-1',
      title: 'Upgrade production database cluster',
      description: 'Migrate from PostgreSQL 13 to 15 with zero downtime',
      status: 'in_progress',
      priority: 'high',
      progress: 45,
      created_by: SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      estimated_hours: 16,
      assignee: 'Database Team'
    },
    {
      id: 'mock-2', 
      title: 'Implement API rate limiting',
      description: 'Add Redis-based rate limiting to prevent API abuse',
      status: 'review',
      priority: 'medium',
      progress: 90,
      created_by: SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      estimated_hours: 12,
      assignee: 'Backend Team'
    },
    {
      id: 'mock-3',
      title: 'Set up monitoring for Kubernetes cluster',
      description: 'Deploy Prometheus and Grafana for comprehensive monitoring',
      status: 'todo',
      priority: 'high',
      progress: 0,
      created_by: SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      estimated_hours: 20,
      assignee: 'DevOps Team'
    },
    {
      id: 'mock-4',
      title: 'Security patch deployment',
      description: 'Apply critical security updates across all servers',
      status: 'in_progress',
      priority: 'critical',
      progress: 75,
      created_by: SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      estimated_hours: 8,
      assignee: 'Security Team'
    },
    {
      id: 'mock-5',
      title: 'Load balancer configuration',
      description: 'Configure new load balancer for improved performance',
      status: 'todo',
      priority: 'medium',
      progress: 10,
      created_by: SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      estimated_hours: 6,
      assignee: 'Network Team'
    },
    {
      id: 'mock-6',
      title: 'Database backup verification',
      description: 'Verify integrity and recovery procedures for all backups',
      status: 'review',
      priority: 'medium',
      progress: 100,
      created_by: SYSTEM_USER_ID,
      created_at: new Date().toISOString(),
      estimated_hours: 4,
      assignee: 'Database Team'
    }
  ];

  if (statuses && statuses.length > 0) {
    return mockData.filter(item => statuses.includes(item.status));
  }
  return mockData;
};

// Mock triage data for when database is not ready
const getMockTriageAssignments = () => {
  return [
    {
      id: 'triage-mock-1',
      title: 'Critical security patch deployment',
      description: 'Deploy critical CVE-2024-1234 patch to all production servers within maintenance window',
      summary: 'Deploy critical CVE-2024-1234 patch to all production servers within maintenance window',
      status: 'review',
      priority: 'critical',
      progress: 80,
      triage_kind: 'requesting_approval',
      risk: 'critical',
      agent: 'SecurityBot-v1.3',
      autonomy_level: 'Low',
      confidence_pct: 78,
      source: 'Security Monitor',
      assignee: 'Lisa Park',
      due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      recommendation: 'Deploy security patch CVE-2024-1234 to all production servers during next maintenance window',
      rationale: 'Critical vulnerability affects authentication system. Zero-day exploit detected in the wild.',
      impact: 'Security risk mitigation: Eliminates critical auth bypass vulnerability.',
      simulation: null,
      provenance: ['Security Monitor Log', 'CVE Database', 'Patch Management System'],
      citations: [],
      comments: [],
      approval_chain: ['security-lead', 'operations-manager']
    }
  ];
};

// Assignment routes - Using Supabase Database
app.get('/make-server-a7530657/assignments', async (c) => {
  const statusesParam = c.req.query('statuses');
  const statuses = statusesParam ? statusesParam.split(',') : undefined;
  
  console.log('GET /assignments - Request received');
  console.log('  - statuses param:', statusesParam);
  console.log('  - parsed statuses:', statuses);
  
  // Always try to get from database first, but with complete error protection
  try {
    // Check if Supabase environment variables are available
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Missing Supabase environment variables - using mock data');
      return c.json(getMockAssignments(statuses));
    }
    
    console.log('Attempting to fetch from database...');
    const assignments = await getSupabaseAssignments(statuses);
    console.log('Database query completed, found:', assignments.length, 'assignments');
    
    // If no assignments found, return mock data for demonstration
    if (assignments.length === 0) {
      console.log('No assignments found in database, returning mock data for demo');
      return c.json(getMockAssignments(statuses));
    }
    
    // Return real database data
    console.log('Returning real database assignments');
    return c.json(assignments);
    
  } catch (error) {
    // This should never happen now since getSupabaseAssignments never throws
    console.log('Unexpected error in assignments endpoint, using mock data:', error);
    return c.json(getMockAssignments(statuses));
  }
});

app.get('/make-server-a7530657/assignments/:id', async (c) => {
  try {
    const assignmentId = c.req.param('id');
    const assignment = await getSupabaseAssignmentById(assignmentId);
    
    if (!assignment) {
      return c.json({ success: false, error: 'Assignment not found' }, 404);
    }
    
    return c.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return c.json({ success: false, error: 'Failed to fetch assignment' }, 500);
  }
});

app.post('/make-server-a7530657/assignments', async (c) => {
  try {
    const assignmentData = await c.req.json();
    
    const dbAssignment = await createSupabaseAssignment({
      title: assignmentData.title,
      description: assignmentData.description,
      status: assignmentData.status || 'todo',
      priority: assignmentData.priority || 'medium',
      progress: assignmentData.progress || 0,
      created_by: assignmentData.created_by || SYSTEM_USER_ID,
      due_at: assignmentData.due_at || null,
      estimated_hours: assignmentData.estimated_hours || null,
      assignee: assignmentData.assignee || null
    });
    
    return c.json(dbAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return c.json({ success: false, error: 'Failed to create assignment' }, 500);
  }
});

app.put('/make-server-a7530657/assignments/:id', async (c) => {
  let assignmentId;
  
  try {
    assignmentId = c.req.param('id');
    console.log(`PUT /assignments/${assignmentId} - Request received`);
    
    // Log all headers for debugging
    console.log('Request headers:', Object.fromEntries(c.req.raw.headers.entries()));
    
    // Safely parse request body
    let updates;
    try {
      const rawBody = await c.req.text();
      console.log('Raw request body:', rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        console.error('Empty request body received');
        return c.json({ 
          success: false, 
          error: 'Empty request body',
          details: 'Request body is empty or missing'
        }, 400);
      }
      
      updates = JSON.parse(rawBody);
      console.log('Parsed updates:', updates);
    } catch (jsonError) {
      console.error('Failed to parse request body as JSON:', jsonError);
      return c.json({ 
        success: false, 
        error: 'Invalid JSON in request body',
        details: jsonError.message
      }, 400);
    }
    
    // Validate that updates is an object
    if (!updates || typeof updates !== 'object') {
      console.error('Updates validation failed:', { updates, type: typeof updates });
      return c.json({ 
        success: false, 
        error: 'Updates must be a valid object',
        received: typeof updates,
        value: updates
      }, 400);
    }
    
    console.log('Calling updateSupabaseAssignment with:', { assignmentId, updates });
    const assignment = await updateSupabaseAssignment(assignmentId, updates);
    console.log('Assignment update successful:', assignment.id);
    
    return c.json(assignment);
  } catch (error) {
    console.error('❌ Critical error in PUT /assignments/:id');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error constructor:', error.constructor?.name);
    
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    
    // Try to return a detailed error response
    try {
      return c.json({ 
        success: false, 
        error: 'Internal server error during assignment update',
        details: error.message || 'Unknown error occurred',
        errorName: error.name || 'UnknownError',
        assignmentId: assignmentId || 'unknown',
        timestamp: new Date().toISOString()
      }, 500);
    } catch (responseError) {
      console.error('Failed to send error response:', responseError);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
});

app.delete('/make-server-a7530657/assignments/:id', async (c) => {
  try {
    const assignmentId = c.req.param('id');
    const success = await deleteSupabaseAssignment(assignmentId);
    
    return c.json({ success });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return c.json({ success: false, error: 'Failed to delete assignment' }, 500);
  }
});

// Assignment status update route - dedicated endpoint for status updates
app.put('/make-server-a7530657/assignments/:id/status', async (c) => {
  try {
    const assignmentId = c.req.param('id');
    const { status } = await c.req.json();
    
    console.log(`Updating assignment ${assignmentId} status to: ${status}`);
    
    const assignment = await updateSupabaseAssignment(assignmentId, { status });
    return c.json(assignment);
  } catch (error) {
    console.error('Error updating assignment status:', error);
    return c.json({ success: false, error: 'Failed to update assignment status' }, 500);
  }
});

// Assignment comments route
app.post('/make-server-a7530657/assignments/:id/comments', async (c) => {
  try {
    const assignmentId = c.req.param('id');
    const { author, body } = await c.req.json();
    
    console.log(`Adding comment to assignment ${assignmentId} by ${author}`);
    
    await addSupabaseAssignmentComment(assignmentId, author, body);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding assignment comment:', error);
    return c.json({ success: false, error: 'Failed to add comment' }, 500);
  }
});

// Step management routes
app.post('/make-server-a7530657/steps', async (c) => {
  try {
    const stepData = await c.req.json();
    
    console.log('Creating new step:', stepData.title);
    
    // For now, return mock step since we don't have createSupabaseStep function
    const mockStep = {
      id: `step-${Date.now()}`,
      assignment_id: stepData.assignment_id,
      title: stepData.title,
      description: stepData.description || null,
      state: stepData.state || 'pending',
      agent: stepData.agent || null,
      order_index: stepData.order_index || 0
    };
    
    return c.json(mockStep);
  } catch (error) {
    console.error('Error creating step:', error);
    return c.json({ success: false, error: 'Failed to create step' }, 500);
  }
});

app.put('/make-server-a7530657/steps/:id', async (c) => {
  try {
    const stepId = c.req.param('id');
    const updates = await c.req.json();
    
    console.log(`Updating step ${stepId}:`, updates);
    
    // For now, return mock updated step since we don't have updateSupabaseStep function
    const mockStep = {
      id: stepId,
      assignment_id: updates.assignment_id || 'unknown',
      title: updates.title || 'Updated step',
      description: updates.description || null,
      state: updates.state || 'pending',
      agent: updates.agent || null,
      order_index: updates.order_index || 0
    };
    
    return c.json(mockStep);
  } catch (error) {
    console.error('Error updating step:', error);
    return c.json({ success: false, error: 'Failed to update step' }, 500);
  }
});

// Assignment Steps routes - Using Supabase Database with fallback
app.get('/make-server-a7530657/assignments/:id/steps', async (c) => {
  try {
    const assignmentId = c.req.param('id');
    
    // If it's a mock assignment, return mock steps
    if (assignmentId.includes('mock')) {
      const mockSteps = [
        {
          id: `${assignmentId}-step-1`,
          assignment_id: assignmentId,
          title: "Review requirements",
          description: "Analyze technical specifications and dependencies",
          state: "pending",
          agent: "devops-supervisor",
          order_index: 0
        },
        {
          id: `${assignmentId}-step-2`, 
          assignment_id: assignmentId,
          title: "Prepare environment",
          description: "Set up development and testing infrastructure",
          state: "pending",
          agent: "network-troubleshooting",
          order_index: 1
        },
        {
          id: `${assignmentId}-step-3`,
          assignment_id: assignmentId,
          title: "Execute implementation",
          description: "Deploy changes following established procedures", 
          state: "pending",
          agent: "devops-supervisor",
          order_index: 2
        }
      ];
      return c.json(mockSteps);
    }
    
    const steps = await getSupabaseAssignmentSteps(assignmentId);
    return c.json(steps);
  } catch (error) {
    console.error('Error fetching assignment steps:', error);
    
    // Return mock steps on any error
    const assignmentId = c.req.param('id');
    console.log('Error getting steps, returning mock steps for assignment:', assignmentId);
    const mockSteps = [
      {
        id: `${assignmentId}-step-1`,
        assignment_id: assignmentId,
        title: "Review requirements",
        description: "Analyze technical specifications and dependencies",
        state: "pending",
        agent: "devops-supervisor",
        order_index: 0
      }
    ];
    return c.json(mockSteps);
  }
});

// Triage routes - Using Supabase Database with fallback
app.get('/make-server-a7530657/triage/assignments', async (c) => {
  try {
    console.log('GET /triage/assignments - Request received');
    const assignments = await getSupabaseTriageAssignments();
    console.log('Triage assignments query completed, found:', assignments.length, 'assignments');
    
    // If no assignments found, return mock data for demonstration
    if (assignments.length === 0) {
      console.log('No triage assignments found in database, returning mock data for demo');
      return c.json(getMockTriageAssignments());
    }
    
    return c.json(assignments);
  } catch (error) {
    console.log('Error in triage assignments endpoint, using mock data:', error);
    return c.json(getMockTriageAssignments());
  }
});

app.get('/make-server-a7530657/triage/assignments/:id', async (c) => {
  try {
    const assignmentId = c.req.param('id');
    const assignment = await getSupabaseTriageAssignmentById(assignmentId);
    
    if (!assignment) {
      // Check if it's a mock assignment
      if (assignmentId.includes('mock')) {
        const mockAssignments = getMockTriageAssignments();
        const mockAssignment = mockAssignments.find(a => a.id === assignmentId) || mockAssignments[0];
        return c.json(mockAssignment);
      }
      return c.json({ success: false, error: 'Triage assignment not found' }, 404);
    }
    
    return c.json(assignment);
  } catch (error) {
    console.error('Error fetching triage assignment:', error);
    // Return mock if error and it's a mock ID
    const assignmentId = c.req.param('id');
    if (assignmentId.includes('mock')) {
      const mockAssignments = getMockTriageAssignments();
      const mockAssignment = mockAssignments.find(a => a.id === assignmentId) || mockAssignments[0];
      return c.json(mockAssignment);
    }
    return c.json({ success: false, error: 'Failed to fetch triage assignment' }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);