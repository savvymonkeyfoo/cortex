import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { AssignmentCard as NewAssignmentCard } from "./AssignmentCards";
import type { Assignment, AssignmentStatus } from "../types/assignment";
import { SYSTEM_USER_ID } from "../constants";

// Legacy assignment card component for backward compatibility
export function AssignmentCard({
  assignment
}: { assignment: {
  title: string; priority: string; description?: string; status: string;
  due_date?: string|null; progress: number; tags: string[];
  est_hours?: number; actual_hours?: number; assignees: Array<{id:string,label:string}>;
}}) {
  return (
    <Card className="rounded-2xl p-4 bg-background border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-lg font-semibold">{assignment.title}</div>
        <Badge variant="secondary" className="capitalize">{assignment.priority}</Badge>
      </div>

      {assignment.description && (
        <div className="text-muted-foreground mt-1">{assignment.description}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <Badge variant="secondary" className="mt-1">{assignment.status}</Badge>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Due Date</div>
          <div className="mt-1">{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '—'}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground">Progress</div>
          <div className="mt-1 flex items-center gap-3">
            <div className="h-2 rounded bg-muted w-full overflow-hidden">
              <div className="h-2 bg-ai-primary" style={{ width: `${assignment.progress||0}%` }} />
            </div>
            <div className="text-sm">{assignment.progress||0}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-xs text-muted-foreground">Assignees</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {(assignment.assignees||[]).map(a => (
              <div key={a.id} className="h-7 px-2 rounded-full bg-muted/60 text-xs flex items-center">{a.label}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Tags</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {(assignment.tags||[]).map(t => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-sm"><span className="text-muted-foreground mr-1">Estimated:</span>{assignment.est_hours ?? 0}h</div>
        <div className="text-sm"><span className="text-muted-foreground mr-1">Actual:</span>{assignment.actual_hours ?? 0}h</div>
      </div>
    </Card>
  );
}

// Helper function to convert legacy assignment to new Assignment type
export function convertLegacyToAssignment(legacy: any): Assignment {
  return {
    id: legacy.id || crypto.randomUUID(),
    title: legacy.title,
    description: legacy.description,
    status: (legacy.status?.toLowerCase() || 'in_progress') as AssignmentStatus,
    priority: legacy.priority || 'medium',
    createdBy: { id: SYSTEM_USER_ID, name: 'System' },
    assignees: legacy.assignees || [],
    tags: legacy.tags || [],
    dueAt: legacy.due_date,
    scheduledFor: legacy.scheduled_for,
    estimatedHours: legacy.est_hours || legacy.estimatedHours,
    actualHours: legacy.actual_hours || legacy.actualHours,
    progress: legacy.progress || 0,
    steps: legacy.tags?.map((tag: string, index: number) => ({
      id: `step-${index}`,
      title: tag,
      status: index === 0 ? 'running' : 'pending'
    })) || [],
    commentsCount: legacy.commentsCount || 0,
    created_at: legacy.created_at || new Date().toISOString(),
    updated_at: legacy.updated_at || new Date().toISOString()
  };
}

// New enhanced assignment card component
export { NewAssignmentCard };