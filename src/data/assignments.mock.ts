// Mock Repository Implementation
import type { AssignmentsRepo, Assignment, Step, TaskStatus } from "./assignments";
import { SYSTEM_USER_ID } from "../constants";

// Mock data - moved from TasksView with enhanced structure
const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Upgrade production database cluster",
    description: "Migrate from PostgreSQL 13 to 15 with zero downtime",
    status: "in_progress",
    priority: "high",
    progress: 45,
    created_by: SYSTEM_USER_ID,
    created_at: "2024-01-10T08:00:00Z",
    assignees: ["db-team", "ops-team"],
    tags: ["database", "upgrade", "production"],
    due_at: "2024-01-15T17:00:00Z",
    estimated_hours: 16,
    actual_hours: 8
  },
  {
    id: "2", 
    title: "Implement API rate limiting",
    description: "Add Redis-based rate limiting to prevent API abuse",
    status: "review",
    priority: "medium",
    progress: 90,
    created_by: SYSTEM_USER_ID,
    created_at: "2024-01-09T09:30:00Z",
    assignees: ["dev-team", "api-team"],
    tags: ["api", "security", "redis"],
    due_at: "2024-01-12T17:00:00Z",
    estimated_hours: 12,
    actual_hours: 14,
    // Approval chain and waiting_on fields
    approval_chain: [
      {"id":"user-1","name":"Sarah Chen","role":"Senior DevOps Engineer","avatar_url":"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face","status":"pending","note":"Sign-off needed"},
      {"id":"user-2","name":"Marcus Rodriguez","role":"Security Lead","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face","status":"waiting"}
    ],
    waiting_on_id: "user-1",
    waiting_on_name: "Sarah Chen",
    waiting_on_role: "Senior DevOps Engineer",
    waiting_on_avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    waiting_on_note: "Sign-off needed"
  },
  {
    id: "3",
    title: "Set up monitoring for Kubernetes cluster",
    description: "Deploy Prometheus and Grafana for comprehensive monitoring",
    status: "todo",
    priority: "high",
    progress: 0,
    created_by: SYSTEM_USER_ID, 
    created_at: "2024-01-08T14:15:00Z",
    assignees: ["k8s-team", "monitoring-team"],
    tags: ["kubernetes", "monitoring", "prometheus"],
    due_at: "2024-01-20T17:00:00Z",
    estimated_hours: 20
  },
  {
    id: "4",
    title: "Security audit of authentication service",
    description: "Comprehensive review of OAuth implementation and token handling",
    status: "done",
    priority: "critical",
    progress: 100,
    created_by: SYSTEM_USER_ID,
    created_at: "2024-01-05T10:00:00Z",
    assignees: ["security-team", "auth-team"],
    tags: ["security", "audit", "oauth"],
    due_at: "2024-01-08T17:00:00Z",
    estimated_hours: 24,
    actual_hours: 26
  },
  {
    id: "5",
    title: "Optimize CI/CD pipeline performance",
    description: "Reduce build times by implementing better caching strategies",
    status: "in_progress",
    priority: "medium",
    progress: 60,
    created_by: SYSTEM_USER_ID,
    created_at: "2024-01-09T11:00:00Z",
    assignees: ["ci-team", "dev-team"],
    tags: ["ci/cd", "performance", "docker"],
    due_at: "2024-01-14T17:00:00Z",
    estimated_hours: 8,
    actual_hours: 4
  },
  {
    id: "6",
    title: "Update SSL certificates",
    description: "Renew expiring certificates across all production services",
    status: "todo",
    priority: "high",
    progress: 0,
    created_by: SYSTEM_USER_ID,
    created_at: "2024-01-08T16:30:00Z",
    assignees: ["security-team", "ops-team"],
    tags: ["ssl", "certificates", "security"],
    due_at: "2024-01-11T17:00:00Z",
    estimated_hours: 4
  },
  {
    id: "7",
    title: "Database backup verification",
    description: "Verify integrity and recovery procedures for all backups",
    status: "review",
    priority: "medium",
    progress: 80,
    created_by: SYSTEM_USER_ID,
    created_at: "2024-01-10T12:00:00Z",
    assignees: ["database-team"],
    tags: ["database", "backup", "verification"],
    due_at: "2024-01-13T17:00:00Z",
    estimated_hours: 4,
    actual_hours: 3,
    // Approval chain and waiting_on fields
    approval_chain: [
      {"id":"user-3","name":"Emily Johnson","role":"Database Administrator","avatar_url":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face","status":"pending","note":"Final approval needed"}
    ],
    waiting_on_id: "user-3",
    waiting_on_name: "Emily Johnson",
    waiting_on_role: "Database Administrator",
    waiting_on_avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    waiting_on_note: "Final approval needed"
  }
];

const mockSteps: Step[] = [
  // Steps for assignment 1 (Database upgrade)
  {
    id: "s1-1",
    assignment_id: "1",
    title: "Setup staging environment",
    description: "Prepare isolated environment for testing the migration",
    state: "done",
    agent: "devops-supervisor",
    order_index: 1
  },
  {
    id: "s1-2", 
    assignment_id: "1",
    title: "Run migration scripts",
    description: "Execute PostgreSQL upgrade procedures",
    state: "running",
    agent: "database-specialist",
    order_index: 2
  },
  {
    id: "s1-3",
    assignment_id: "1", 
    title: "Validate data integrity",
    description: "Verify all data migrated correctly",
    state: "pending",
    agent: "database-specialist",
    order_index: 3
  },

  // Steps for assignment 2 (API rate limiting)
  {
    id: "s2-1",
    assignment_id: "2",
    title: "Implement rate limiting middleware",
    description: "Create Redis-based rate limiting logic",
    state: "done",
    agent: "backend-developer",
    order_index: 1
  },
  {
    id: "s2-2",
    assignment_id: "2",
    title: "Add configuration options",
    description: "Make rate limits configurable per endpoint",
    state: "done", 
    agent: "backend-developer",
    order_index: 2
  },
  {
    id: "s2-3",
    assignment_id: "2",
    title: "Performance testing",
    description: "Load test the rate limiting implementation",
    state: "done",
    agent: "qa-engineer",
    order_index: 3
  },

  // Steps for assignment 3 (Kubernetes monitoring)
  {
    id: "s3-1",
    assignment_id: "3",
    title: "Deploy Prometheus operator",
    description: "Install Prometheus operator in kube-system namespace",
    state: "pending",
    agent: "devops-supervisor", 
    order_index: 1
  },
  {
    id: "s3-2",
    assignment_id: "3",
    title: "Configure service monitors",
    description: "Set up monitoring for critical cluster components",
    state: "pending",
    agent: "network-troubleshooting",
    order_index: 2
  },
  {
    id: "s3-3",
    assignment_id: "3",
    title: "Deploy Grafana dashboards",
    description: "Install pre-configured dashboards for cluster visibility",
    state: "pending",
    agent: "network-cost-management",
    order_index: 3
  },
  {
    id: "s3-4",
    assignment_id: "3",
    title: "Setup alerting rules",
    description: "Configure alerts for critical system metrics",
    state: "pending",
    agent: "network-troubleshooting",
    order_index: 4
  },

  // Steps for assignment 6 (SSL certificates)
  {
    id: "s6-1",
    assignment_id: "6",
    title: "Generate new certificates",
    description: "Create SSL certificates with 2-year validity",
    state: "pending",
    agent: "devops-supervisor",
    order_index: 1
  },
  {
    id: "s6-2",
    assignment_id: "6", 
    title: "Update load balancers",
    description: "Deploy certificates to production load balancers",
    state: "pending",
    agent: "network-troubleshooting",
    order_index: 2
  },
  {
    id: "s6-3",
    assignment_id: "6",
    title: "Verify certificate chain", 
    description: "Test SSL connectivity across all services",
    state: "pending",
    agent: "network-cost-management",
    order_index: 3
  }
];

// Mock repository implementation
export const mockRepo: AssignmentsRepo = {
  async list({ statuses }: { statuses?: TaskStatus[] } = {}): Promise<Assignment[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let filtered = [...mockAssignments];
    
    if (statuses && statuses.length > 0) {
      filtered = filtered.filter(assignment => statuses.includes(assignment.status));
    }
    
    // Sort by created_at descending
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async listSteps(assignmentId: string): Promise<Step[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return mockSteps
      .filter(step => step.assignment_id === assignmentId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  async create(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newAssignment: Assignment = {
      ...assignment,
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    mockAssignments.unshift(newAssignment);
    return newAssignment;
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }
    
    mockAssignments[index] = { ...mockAssignments[index], ...assignment };
    return mockAssignments[index];
  },

  async createStep(step: Omit<Step, 'id'>): Promise<Step> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newStep: Step = {
      ...step,
      id: `step-${Date.now()}`
    };
    
    mockSteps.push(newStep);
    return newStep;
  },

  async updateStep(id: string, step: Partial<Step>): Promise<Step> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = mockSteps.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Step with id ${id} not found`);
    }
    
    mockSteps[index] = { ...mockSteps[index], ...step };
    return mockSteps[index];
  }
};