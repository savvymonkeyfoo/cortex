import { AssignmentCard } from "./AssignmentCards";
import { useAssignment } from "../hooks/useAssignment";

function AssignmentCardWidget({ assignmentId }: { assignmentId: string }) {
  const { data: assignment, loading } = useAssignment(assignmentId);

  if (loading) {
    return (
      <div className="rounded-2xl p-4 bg-background border-border shadow-sm animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="rounded-2xl p-4 bg-background border-border shadow-sm">
        <div className="text-sm text-muted-foreground">Assignment not found</div>
      </div>
    );
  }

  return <AssignmentCard a={assignment} />;
}

export { AssignmentCardWidget };