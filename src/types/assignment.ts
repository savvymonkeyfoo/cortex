// Database types matching the new schema
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type StepState = 'pending' | 'running' | 'done';
export type TriageType = 'requesting_approval' | 'exception' | 'fyi';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CitationType = 'log' | 'pdf' | 'confluence' | 'metrics' | 'security' | 'database';

// Legacy aliases for backward compatibility
export type AssignmentStatus = TaskStatus;
export type Priority = TaskPriority;

// Database assignment step
export interface AssignmentStep {
  id: string;
  assignment_id: string;
  title: string;
  description?: string;
  state: StepState;
  agent?: string;
  order_index: number;
}

// Database citation
export interface AssignmentCitation {
  id: string;
  title: string;
  type: CitationType;
  url: string;
  timestamp?: string; // ISO string
}

// Database comment
export interface AssignmentComment {
  author: string;
  text: string;
  time: string; // ISO string
}

// Full database assignment record
export interface DatabaseAssignment {
  id: string;
  title: string;
  description: string;
  summary?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  
  // Triage fields
  triage_kind?: TriageType;
  risk?: RiskLevel;
  agent?: string;
  autonomy_level?: string;
  confidence_pct?: number;
  source?: string;
  assignee?: string;
  due_at?: string; // ISO string
  
  // Details
  recommendation?: string;
  rationale?: string;
  impact?: string;
  simulation?: string;
  
  created_by: string;
  created_at: string;
  estimated_hours?: number;

  // Approval chain and waiting_on fields
  approval_chain?: any; // jsonb (optional)
  waiting_on_id?: string | null;
  waiting_on_name?: string | null;
  waiting_on_role?: string | null;
  waiting_on_avatar_url?: string | null;
  waiting_on_note?: string | null;
}

// Triage view record (includes aggregated relations)
export interface TriageAssignment extends DatabaseAssignment {
  provenance: string[];
  citations: AssignmentCitation[];
  comments: AssignmentComment[];
  approval_chain: string[];
}

// Legacy Assignment interface for backward compatibility
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  status: AssignmentStatus;
  priority: Priority;
  createdBy: { id: string; name: string };
  assignees: Array<{ id: string; label: string }>;
  tags: string[];
  dueAt?: string;            // ISO
  scheduledFor?: string;     // ISO (for todo countdown)
  estimatedHours?: number;
  estimatedMinutes?: number; // For more granular time tracking
  actualHours?: number;
  progress?: number;         // 0..100
  steps: AssignmentStep[];
  commentsCount?: number;
  created_at: string;
  updated_at: string;

  // Approval chain and waiting_on fields
  approval_chain?: any; // jsonb (optional)
  waiting_on_id?: string | null;
  waiting_on_name?: string | null;
  waiting_on_role?: string | null;
  waiting_on_avatar_url?: string | null;
  waiting_on_note?: string | null;
}