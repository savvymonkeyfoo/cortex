// Supabase Repository Implementation - Updated for new unified schema
import type { AssignmentsRepo, Assignment, Step, TaskStatus } from "./assignments";
import type { 
  DatabaseAssignment, 
  TriageAssignment, 
  AssignmentStep as DatabaseStep, 
  TaskStatus as NewTaskStatus 
} from "../types/assignment";

// Note: This implementation would require actual Supabase setup.
// For now, we'll use the existing KV store from the server as a backend.

// Since we can't directly use Supabase client in this environment,
// we'll make requests to our server endpoints instead.
import { projectId, publicAnonKey } from '../utils/supabase/info';

const SERVER_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a7530657`;

async function makeRequest(path: string, options: RequestInit = {}) {
  const url = `${SERVER_BASE_URL}${path}`;
  console.log('🔄 Making request to:', url);
  
  try {
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log('✅ Response received:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', response.status, response.statusText, errorText);
      
      // Provide more specific error messages
      if (response.status === 404) {
        throw new Error(`Server endpoint not found: ${path}`);
      } else if (response.status >= 500) {
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      } else if (response.status === 403) {
        throw new Error(`Authentication failed - check API keys`);
      } else {
        throw new Error(`Request failed: ${response.status} ${response.statusText}: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('📊 Response data received:', Array.isArray(data) ? `${data.length} items` : typeof data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Request timeout for URL:', url);
      throw new Error(`Request timed out after 30 seconds: ${path}`);
    }
    
    if (error.message.includes('Failed to fetch')) {
      console.error('🌐 Network error for URL:', url, '- Server may not be deployed or CORS issue');
      throw new Error(`Cannot connect to server at ${url}. Server may not be deployed or there's a network issue.`);
    }
    
    console.error('💥 Fetch error for URL:', url, error);
    throw error;
  }
}

// Helper function to hydrate waiting_on fields from approval_chain
function hydrateWaitingOn(a: Assignment): Assignment {
  // Only normalize for review status
  if (a.status !== 'review') {
    return {
      ...a,
      waiting_on_id: null,
      waiting_on_name: null,
      waiting_on_role: null,
      waiting_on_avatar_url: null,
    };
  }

  // If DB already has explicit reviewer, use it as-is
  if (a.waiting_on_name) return a;

  // 1) Try to infer from approval_chain pending entry
  if (Array.isArray(a.approval_chain)) {
    const pending = a.approval_chain.find((x: any) => x?.status === 'pending');
    if (pending) {
      return {
        ...a,
        waiting_on_id: pending.id ?? null,
        waiting_on_name: pending.name ?? null,
        waiting_on_role: pending.role ?? null,
        waiting_on_avatar_url: pending.avatar_url ?? null,
        waiting_on_note: pending.note ?? null,
      };
    }
  }

  // 2) Fallback to first assignee for review label when approval_chain is absent
  if (Array.isArray(a.assignees) && a.assignees.length > 0) {
    return {
      ...a,
      waiting_on_name: a.assignees[0] ?? null,
    } as Assignment;
  }

  // 3) Final fallback: leave as-is (component will handle generic label)
  return a;
}

// Helper function to convert DatabaseAssignment to legacy Assignment format
function convertToLegacyAssignment(dbAssignment: DatabaseAssignment): Assignment {
  return {
    id: dbAssignment.id,
    title: dbAssignment.title,
    description: dbAssignment.description,
    status: dbAssignment.status,
    priority: dbAssignment.priority,
    progress: dbAssignment.progress,
    created_by: dbAssignment.created_by,
    created_at: dbAssignment.created_at,
    assignees: dbAssignment.assignee ? [dbAssignment.assignee] : [],
    tags: [],
    due_at: dbAssignment.due_at,
    estimated_hours: dbAssignment.estimated_hours,
    actual_hours: undefined,
    // Include approval chain and waiting_on fields
    approval_chain: dbAssignment.approval_chain,
    waiting_on_id: dbAssignment.waiting_on_id,
    waiting_on_name: dbAssignment.waiting_on_name,
    waiting_on_role: dbAssignment.waiting_on_role,
    waiting_on_avatar_url: dbAssignment.waiting_on_avatar_url,
    waiting_on_note: dbAssignment.waiting_on_note,
  };
}

// Helper function to convert DatabaseStep to legacy Step format
function convertToLegacyStep(dbStep: DatabaseStep): Step {
  return {
    id: dbStep.id,
    assignment_id: dbStep.assignment_id,
    title: dbStep.title,
    description: dbStep.description || null,
    state: dbStep.state,
    agent: dbStep.agent || null,
    order_index: dbStep.order_index,
  };
}

// Fallback mock data
const getMockAssignments = (statuses?: TaskStatus[]): Assignment[] => {
  const mockData: Assignment[] = [
    {
      id: 'mock-1',
      title: 'Upgrade production database cluster',
      description: 'Migrate from PostgreSQL 13 to 15 with zero downtime',
      status: 'in_progress',
      priority: 'high',
      progress: 45,
      created_by: 'system',
      created_at: new Date().toISOString(),
      estimated_hours: 16,
      assignees: ['Database Team'],
      tags: [],
    },
    {
      id: 'mock-2', 
      title: 'Implement API rate limiting',
      description: 'Add Redis-based rate limiting to prevent API abuse',
      status: 'review',
      priority: 'medium',
      progress: 90,
      created_by: 'system',
      created_at: new Date().toISOString(),
      estimated_hours: 12,
      assignees: ['Backend Team'],
      tags: [],
    },
    {
      id: 'mock-3',
      title: 'Set up monitoring for Kubernetes cluster',
      description: 'Deploy Prometheus and Grafana for comprehensive monitoring',
      status: 'todo',
      priority: 'high',
      progress: 0,
      created_by: 'system',
      created_at: new Date().toISOString(),
      estimated_hours: 20,
      assignees: ['DevOps Team'],
      tags: [],
    },
    {
      id: 'mock-4',
      title: 'Security patch deployment',
      description: 'Apply critical security updates across all servers',
      status: 'in_progress',
      priority: 'critical',
      progress: 75,
      created_by: 'system',
      created_at: new Date().toISOString(),
      estimated_hours: 8,
      assignees: ['Security Team'],
      tags: [],
    },
    {
      id: 'mock-5',
      title: 'Load balancer configuration',
      description: 'Configure new load balancer for improved performance',
      status: 'todo',
      priority: 'medium',
      progress: 10,
      created_by: 'system',
      created_at: new Date().toISOString(),
      estimated_hours: 6,
      assignees: ['Network Team'],
      tags: [],
    },
    {
      id: 'mock-6',
      title: 'Database backup verification',
      description: 'Verify integrity and recovery procedures for all backups',
      status: 'review',
      priority: 'medium',
      progress: 100,
      created_by: 'system',
      created_at: new Date().toISOString(),
      estimated_hours: 4,
      assignees: ['Database Team'],
      tags: [],
    }
  ];

  if (statuses && statuses.length > 0) {
    return mockData.filter(item => statuses.includes(item.status));
  }
  return mockData;
};

export const supabaseRepo: AssignmentsRepo = {
  async list({ statuses }: { statuses?: TaskStatus[] } = {}): Promise<Assignment[]> {
    try {
      const params = new URLSearchParams();
      if (statuses && statuses.length > 0) {
        params.append('statuses', statuses.join(','));
      }
      
      const url = `/assignments${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🔄 Loading assignments with statuses:', statuses);
      
      const dbAssignments: DatabaseAssignment[] = await makeRequest(url);
      console.log('✅ Successfully loaded', dbAssignments.length, 'assignments from server');
      const normalized = dbAssignments.map(convertToLegacyAssignment).map(hydrateWaitingOn);
      return normalized;
    } catch (error) {
      console.warn('⚠️ Server request failed, falling back to mock data:', error);
      console.log('🎭 Using mock assignments for statuses:', statuses);
      return getMockAssignments(statuses);
    }
  },

  async listSteps(assignmentId: string): Promise<Step[]> {
    try {
      const dbSteps: DatabaseStep[] = await makeRequest(`/assignments/${assignmentId}/steps`);
      return dbSteps.map(convertToLegacyStep);
    } catch (error) {
      console.error('Failed to load steps from server, using mock data:', error);
      // Return mock steps
      return [
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
    }
  },

  async create(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    const dbAssignment: DatabaseAssignment = await makeRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
    return convertToLegacyAssignment(dbAssignment);
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    console.log('🔄 supabaseRepo.update called with:', { id, assignment });
    
    // Convert legacy Assignment format to DatabaseAssignment format for the API
    const dbUpdates: Partial<DatabaseAssignment> = {
      title: assignment.title,
      description: assignment.description,
      status: assignment.status,
      priority: assignment.priority,
      progress: assignment.progress,
      created_by: assignment.created_by,
      // Convert assignees array back to single assignee if present
      assignee: assignment.assignees?.[0] || null,
      due_at: assignment.due_at,
      estimated_hours: assignment.estimated_hours,
      // Include waiting_on fields for review assignments
      waiting_on_id: assignment.waiting_on_id,
      waiting_on_name: assignment.waiting_on_name,
      waiting_on_role: assignment.waiting_on_role,
      waiting_on_avatar_url: assignment.waiting_on_avatar_url,
      waiting_on_note: assignment.waiting_on_note,
    };
    
    // Remove undefined values to avoid sending them
    const cleanUpdates = Object.fromEntries(
      Object.entries(dbUpdates).filter(([_, value]) => value !== undefined)
    );
    
    console.log('📤 Sending database updates:', cleanUpdates);
    
    const dbAssignment: DatabaseAssignment = await makeRequest(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanUpdates),
    });
    
    console.log('📥 Received database response:', dbAssignment);
    return convertToLegacyAssignment(dbAssignment);
  },

  async createStep(step: Omit<Step, 'id'>): Promise<Step> {
    const dbStep: DatabaseStep = await makeRequest('/steps', {
      method: 'POST',
      body: JSON.stringify(step),
    });
    return convertToLegacyStep(dbStep);
  },

  async updateStep(id: string, step: Partial<Step>): Promise<Step> {
    const dbStep: DatabaseStep = await makeRequest(`/steps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(step),
    });
    return convertToLegacyStep(dbStep);
  }
};

// New Triage Repository functions for working with the unified schema
export const triageRepo = {
  // Get all triage assignments (status = 'review')
  async listTriageAssignments(): Promise<TriageAssignment[]> {
    return await makeRequest('/triage/assignments');
  },

  // Get a specific triage assignment with all relations
  async getTriageAssignment(id: string): Promise<TriageAssignment> {
    return await makeRequest(`/triage/assignments/${id}`);
  },

  // Add a comment to an assignment
  async addComment(assignmentId: string, author: string, body: string): Promise<void> {
    await makeRequest(`/assignments/${assignmentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ author, body }),
    });
  },

  // Update assignment status (approve, reject, etc.)
  async updateAssignmentStatus(id: string, status: NewTaskStatus): Promise<DatabaseAssignment> {
    return await makeRequest(`/assignments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get steps for an assignment
  async getAssignmentSteps(assignmentId: string): Promise<DatabaseStep[]> {
    return await makeRequest(`/assignments/${assignmentId}/steps`);
  }
};

/* 
=== SUPABASE SCHEMA (for reference) ===

When you're ready to use actual Supabase, run these SQL commands in your Supabase dashboard:

-- assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo','in_progress','review','done')),
  priority TEXT NOT NULL CHECK (priority IN ('low','medium','high','critical')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_by TEXT NOT NULL, -- or UUID if using auth
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assignees TEXT[], -- array of assignee IDs
  tags TEXT[], -- array of tags
  due_at TIMESTAMPTZ,
  estimated_hours INT,
  actual_hours INT
);

-- steps table
CREATE TABLE public.assignment_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  state TEXT NOT NULL CHECK (state IN ('pending','running','done')),
  agent TEXT,
  order_index INT NOT NULL DEFAULT 0
);

-- indexes for performance
CREATE INDEX ON public.assignments (status, priority);
CREATE INDEX ON public.assignments (created_at DESC);
CREATE INDEX ON public.assignment_steps (assignment_id, order_index);

-- Row Level Security (basic setup)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_steps ENABLE ROW LEVEL SECURITY;

-- Basic read policies (adjust based on your auth requirements)
CREATE POLICY "read_all_assignments"
ON public.assignments FOR SELECT
USING (true);

CREATE POLICY "read_all_steps"
ON public.assignment_steps FOR SELECT
USING (true);

-- You can add more restrictive policies based on your auth setup
-- CREATE POLICY "users_can_create_assignments"
-- ON public.assignments FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid()::text = created_by);

*/