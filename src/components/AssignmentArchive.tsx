import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { DoneCard, type Step, type Assignment as NewAssignment } from "./AssignmentCards";
import { useAssignments } from "../hooks/useAssignments";

export function AssignmentArchive() {
  // Load completed assignments using the custom hook
  const { assignments, loading } = useAssignments(["done"]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Assignment Archive</h1>
        <Badge variant="outline" className="text-sm">
          Completed Assignments
        </Badge>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="bg-background-subtle rounded-lg p-4 h-full border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              Completed Assignments
              <Badge variant="outline" className="text-xs">
                {assignments.length}
              </Badge>
            </h2>
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {loading ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Loading completed assignments...
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No completed assignments yet. Completed assignments will appear here once moved from the Live Assignments board.
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-3 pr-4">
                  {assignments.map(assignment => {
                    // Convert repository Assignment to component Assignment format
                    const componentAssignment: NewAssignment = {
                      id: assignment.id,
                      title: assignment.title,
                      description: assignment.description,
                      priority: assignment.priority,
                      createdBy: { id: assignment.created_by, name: "System" },
                      progress: assignment.progress,
                    };

                    // Create mock completed steps
                    const completedSteps: Step[] = [
                      { id: "s1", title: "Requirements review", description: "Analyzed technical specifications and dependencies", state: "done", agent: "devops-supervisor" },
                      { id: "s2", title: "Environment preparation", description: "Set up development and testing infrastructure", state: "done", agent: "network-troubleshooting" },
                      { id: "s3", title: "Implementation", description: "Deployed changes following established procedures", state: "done", agent: "devops-supervisor" },
                      { id: "s4", title: "Testing & validation", description: "Verified functionality and performance", state: "done", agent: "qa-engineer" },
                    ];

                    return (
                      <DoneCard
                        key={assignment.id}
                        assignment={componentAssignment}
                        steps={completedSteps}
                        completedAtISO={assignment.created_at}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}