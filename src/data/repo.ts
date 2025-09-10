// Repository Selector - Single import to switch between implementations

import { mockRepo } from './assignments.mock';
import { supabaseRepo } from './assignments.supabase';

// Easy switch: Change this single line to switch between implementations
export const repo = mockRepo;
// export const repo = supabaseRepo;

// Re-export types for convenience
export type { AssignmentsRepo, Assignment, Step, TaskStatus, TaskPriority } from './assignments';

// Re-export new database types
export type { 
  DatabaseAssignment, 
  TriageAssignment, 
  AssignmentStep as DatabaseStep, 
  AssignmentCitation, 
  AssignmentComment,
  TriageType,
  RiskLevel,
  CitationType
} from '../types/assignment';