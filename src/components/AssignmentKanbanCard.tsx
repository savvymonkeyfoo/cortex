// AssignmentKanbanCard.tsx - Streamlined Kanban card wrapper
import React from 'react';
import type { Assignment as RepoAssignment, TaskStatus } from '../data/repo';
import type { Assignment as ComponentAssignment } from './AssignmentCards';
import { TodoCard, InProgressCard, ReviewCard, DoneCard } from './AssignmentCards';
import { generateStepsForAssignment, getEstimatedTimeMinutes } from '../utils/assignmentSteps';

interface AssignmentKanbanCardProps {
  assignment: RepoAssignment;
  status: TaskStatus;
}

export function AssignmentKanbanCard({ assignment, status }: AssignmentKanbanCardProps) {
  // Convert repository Assignment to component Assignment format
  const componentAssignment: ComponentAssignment = {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    priority: assignment.priority,
    createdBy: { id: assignment.created_by, name: "System" },
    progress: assignment.progress,
  };

  // Generate steps dynamically based on assignment content and status
  const steps = generateStepsForAssignment(assignment, status);
  const estimatedMinutes = getEstimatedTimeMinutes(assignment, status);

  // Render appropriate card based on status
  switch (status) {
    case 'todo':
      return (
        <TodoCard
          assignment={componentAssignment}
          steps={steps}
          estimateMinutes={estimatedMinutes}
        />
      );

    case 'in_progress':
      return (
        <InProgressCard
          assignment={componentAssignment}
          steps={steps}
          etaMinutes={estimatedMinutes}
        />
      );

    case 'review':
      // Use real waiting_on data from assignment, fallback to generic message
      const waitingOnData = assignment.waiting_on_name 
        ? { 
            id: assignment.waiting_on_id || "unknown", 
            name: assignment.waiting_on_name,
            role: assignment.waiting_on_role,
            avatar_url: assignment.waiting_on_avatar_url
          }
        : { id: "review", name: "review" }; // Fallback when no specific approver
      
      return (
        <ReviewCard
          assignment={componentAssignment}
          steps={steps}
          waitingOn={waitingOnData}
        />
      );

    case 'done':
      return (
        <DoneCard
          assignment={componentAssignment}
          steps={steps}
          completedAtISO={assignment.created_at} // Using created_at as placeholder for completed_at
        />
      );

    default:
      return null;
  }
}