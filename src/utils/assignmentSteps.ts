// Assignment Step Generation Utilities
import type { Step } from '../components/AssignmentCards';
import type { Assignment, TaskStatus } from '../data/repo';

// Step template categories for different assignment types
const stepTemplates = {
  monitoring: [
    { 
      title: "Deploy Prometheus operator", 
      description: "Install Prometheus operator in kube-system namespace", 
      agent: "devops-supervisor" as const 
    },
    { 
      title: "Configure service monitors", 
      description: "Set up monitoring for critical cluster components", 
      agent: "network-troubleshooting" as const 
    },
    { 
      title: "Deploy Grafana dashboards", 
      description: "Install pre-configured dashboards for cluster visibility", 
      agent: "network-cost-management" as const 
    },
    { 
      title: "Setup alerting rules", 
      description: "Configure alerts for critical system metrics", 
      agent: "network-troubleshooting" as const 
    },
  ],
  
  certificates: [
    { 
      title: "Generate new certificates", 
      description: "Create SSL certificates with 2-year validity", 
      agent: "devops-supervisor" as const 
    },
    { 
      title: "Update load balancers", 
      description: "Deploy certificates to production load balancers", 
      agent: "network-troubleshooting" as const 
    },
    { 
      title: "Verify certificate chain", 
      description: "Test SSL connectivity across all services", 
      agent: "network-cost-management" as const 
    },
  ],
  
  database: [
    { 
      title: "Create backup snapshot", 
      description: "Take a full backup before making changes", 
      agent: "devops-supervisor" as const 
    },
    { 
      title: "Update database schema", 
      description: "Apply migration scripts and validate changes", 
      agent: "network-troubleshooting" as const 
    },
    { 
      title: "Verify data integrity", 
      description: "Run consistency checks and performance tests", 
      agent: "network-cost-management" as const 
    },
  ],
  
  deployment: [
    { 
      title: "Prepare deployment environment", 
      description: "Set up staging and production infrastructure", 
      agent: "devops-supervisor" as const 
    },
    { 
      title: "Deploy application", 
      description: "Roll out new version with zero-downtime strategy", 
      agent: "network-troubleshooting" as const 
    },
    { 
      title: "Run health checks", 
      description: "Validate deployment and service connectivity", 
      agent: "network-cost-management" as const 
    },
  ],

  security: [
    { 
      title: "Security assessment", 
      description: "Evaluate potential security implications", 
      agent: "devops-supervisor" as const 
    },
    { 
      title: "Apply security patches", 
      description: "Update systems with latest security fixes", 
      agent: "network-troubleshooting" as const 
    },
    { 
      title: "Validate security controls", 
      description: "Test access controls and audit logs", 
      agent: "network-cost-management" as const 
    },
  ],

  generic: [
    { 
      title: "Review requirements", 
      description: "Analyze technical specifications and dependencies", 
      agent: "devops-supervisor" as const 
    },
    { 
      title: "Prepare environment", 
      description: "Set up development and testing infrastructure", 
      agent: "network-troubleshooting" as const 
    },
    { 
      title: "Execute implementation", 
      description: "Deploy changes following established procedures", 
      agent: "devops-supervisor" as const 
    },
  ],
};

// Determine step template category based on assignment content
function getStepTemplateCategory(assignment: Assignment): keyof typeof stepTemplates {
  const titleLower = assignment.title.toLowerCase();
  const descriptionLower = assignment.description?.toLowerCase() || '';
  const content = `${titleLower} ${descriptionLower}`;

  // Check for monitoring-related keywords
  if (content.includes('monitor') || content.includes('prometheus') || content.includes('grafana') || content.includes('alert')) {
    return 'monitoring';
  }

  // Check for certificate-related keywords
  if (content.includes('certificate') || content.includes('ssl') || content.includes('tls') || content.includes('cert')) {
    return 'certificates';
  }

  // Check for database-related keywords
  if (content.includes('database') || content.includes('db') || content.includes('migration') || content.includes('schema')) {
    return 'database';
  }

  // Check for deployment-related keywords
  if (content.includes('deploy') || content.includes('release') || content.includes('rollout') || content.includes('version')) {
    return 'deployment';
  }

  // Check for security-related keywords
  if (content.includes('security') || content.includes('patch') || content.includes('vulnerability') || content.includes('audit')) {
    return 'security';
  }

  // Default to generic steps
  return 'generic';
}

// Generate steps based on assignment status and content
export function generateStepsForAssignment(assignment: Assignment, status: TaskStatus): Step[] {
  const category = getStepTemplateCategory(assignment);
  const templates = stepTemplates[category];

  // Generate steps with proper IDs and states based on status
  const steps: Step[] = templates.map((template, index) => ({
    id: `${assignment.id}-step-${index + 1}`,
    title: template.title,
    description: template.description,
    state: getStepState(status, index, templates.length),
    agent: template.agent,
  }));

  return steps;
}

// Determine step state based on assignment status and step position
function getStepState(status: TaskStatus, stepIndex: number, totalSteps: number): Step['state'] {
  switch (status) {
    case 'todo':
      // All steps are pending for todo assignments
      return 'pending';
    
    case 'in_progress':
      // First step is done, second is running, rest are pending
      if (stepIndex === 0) return 'done';
      if (stepIndex === 1) return 'running';
      return 'pending';
    
    case 'review':
      // All steps are done for review assignments
      return 'done';
    
    case 'done':
      // All steps are done for completed assignments
      return 'done';
    
    default:
      return 'pending';
  }
}

// Calculate dynamic progress based on step states
export function calculateProgressFromSteps(steps: Step[]): number {
  if (steps.length === 0) return 0;
  
  const completedSteps = steps.filter(step => step.state === 'done').length;
  const runningSteps = steps.filter(step => step.state === 'running').length;
  
  // Running steps count as 50% complete
  const progress = (completedSteps + runningSteps * 0.5) / steps.length * 100;
  
  return Math.round(progress);
}

// Get estimated time remaining based on steps
export function getEstimatedTimeMinutes(assignment: Assignment, status: TaskStatus): number {
  const baseHours = assignment.estimated_hours || 2; // Default 2 hours
  const baseMinutes = baseHours * 60;
  
  switch (status) {
    case 'todo':
      // Return estimate capped at 60 minutes for display
      return Math.min(baseMinutes, 60);
    
    case 'in_progress':
      // Estimate remaining time based on progress
      const remainingMinutes = Math.max(baseMinutes * 0.4, 15); // At least 15 minutes remaining
      return Math.round(remainingMinutes);
    
    case 'review':
      // Almost done, just waiting for approval
      return 5;
    
    case 'done':
      return 0;
    
    default:
      return baseMinutes;
  }
}

// Generate dynamic notes for assignment status
export function generateStatusNote(assignment: Assignment, status: TaskStatus, steps: Step[]): string {
  const runningStep = steps.find(step => step.state === 'running');
  const completedSteps = steps.filter(step => step.state === 'done').length;
  const totalSteps = steps.length;

  switch (status) {
    case 'todo':
      return 'Scheduled and pending. All steps queued in order.';
    
    case 'in_progress':
      if (runningStep) {
        return `Executing: ${runningStep.title}`;
      }
      return `Executing step ${completedSteps + 1}/${totalSteps}…`;
    
    case 'review':
      return 'All steps completed. Awaiting final review and approval.';
    
    case 'done':
      return 'Successfully deployed and verified.';
    
    default:
      return 'Assignment status unknown.';
  }
}