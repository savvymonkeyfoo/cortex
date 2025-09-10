// Assignment Repository Interface and Types
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0..100
  created_by: string; // user id (UUID)
  created_at: string;
  assignees?: string[]; // assignee IDs
  tags?: string[];
  due_at?: string; // ISO string
  estimated_hours?: number;
  actual_hours?: number;

  // Approval chain and waiting_on fields
  approval_chain?: any; // jsonb (optional)
  waiting_on_id?: string | null;
  waiting_on_name?: string | null;
  waiting_on_role?: string | null;
  waiting_on_avatar_url?: string | null;
  waiting_on_note?: string | null;
}

export interface Step {
  id: string;
  assignment_id: string;
  title: string;
  description: string | null;
  state: "pending" | "running" | "done";
  agent: string | null;
  order_index: number;
}

export interface AssignmentsRepo {
  list(params: { statuses?: TaskStatus[] }): Promise<Assignment[]>;
  listSteps(assignmentId: string): Promise<Step[]>;
  create(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment>;
  update(id: string, assignment: Partial<Assignment>): Promise<Assignment>;
  createStep(step: Omit<Step, 'id'>): Promise<Step>;
  updateStep(id: string, step: Partial<Step>): Promise<Step>;
}