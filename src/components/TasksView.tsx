import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "./ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { useAssignments } from "../hooks/useAssignments";
import type { Assignment, TaskStatus } from "../data/repo";
import { AssignmentKanbanCard } from "./AssignmentKanbanCard";
import { DndProvider, useDrop, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Clock,
  Calendar,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  MessageSquare,
  Bell,
  User,
  ArrowRight,
  Activity,
  TrendingUp,
  Zap,
  Target,
  GitBranch,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FileText,
  ExternalLink,
  Plus,
  Filter,
  Search,
  Star,
  Clock4,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  RefreshCw
} from "lucide-react";

// Drag and Drop Types
const ItemTypes = {
  ASSIGNMENT_CARD: 'assignment-card',
};

interface DragItem {
  type: string;
  id: string;
  status: TaskStatus;
}

// Column Drop Zone Component
interface ColumnDropZoneProps {
  status: TaskStatus;
  onDrop: (item: DragItem, targetStatus: TaskStatus) => void;
  children: React.ReactNode;
}

function ColumnDropZone({ status, onDrop, children }: ColumnDropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.ASSIGNMENT_CARD,
    drop: (item: DragItem) => {
      if (item.status !== status) {
        onDrop(item, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const dropZoneClass = `
    ${isOver && canDrop ? 'bg-ai-primary/5 border-ai-primary/30 scale-[1.02]' : ''}
    ${isOver && !canDrop ? 'bg-destructive/5 border-destructive/30' : ''}
    ${canDrop && !isOver ? 'border-dashed border-2 border-muted' : ''}
    ${isOver && canDrop ? 'border-dashed border-2' : 'border-transparent border-2'}
    transition-all duration-200 ease-in-out rounded-lg p-1
  `;

  return (
    <div ref={drop} className={dropZoneClass}>
      {children}
    </div>
  );
}

// Draggable Assignment Card Component
interface DraggableAssignmentCardProps {
  assignment: Assignment;
  status: TaskStatus;
  isDragging?: boolean;
}

function DraggableAssignmentCard({ assignment, status, isDragging }: DraggableAssignmentCardProps) {
  const [{ isDragging: dragMonitorIsDragging }, drag] = useDrag({
    type: ItemTypes.ASSIGNMENT_CARD,
    item: { 
      type: ItemTypes.ASSIGNMENT_CARD,
      id: assignment.id, 
      status: assignment.status 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isDragging, // Prevent dragging if already being processed
  });

  const isCurrentlyDragging = isDragging || dragMonitorIsDragging;

  const cardClass = `
    ${isCurrentlyDragging ? 'opacity-60 scale-105 rotate-2 shadow-2xl z-50' : 'opacity-100 scale-100 rotate-0'}
    ${!isCurrentlyDragging ? 'hover:scale-105 hover:-translate-y-1' : ''}
    transition-all duration-200 ease-in-out cursor-grab active:cursor-grabbing
    ${isCurrentlyDragging ? 'pointer-events-none' : ''}
  `;

  return (
    <div 
      ref={drag} 
      className={cardClass}
      role="button"
      tabIndex={0}
      aria-label={`Drag to move assignment "${assignment.title}" to different status`}
      onKeyDown={(e) => {
        // Future: Could add keyboard navigation support
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Could open a status selection menu
        }
      }}
    >
      <AssignmentKanbanCard
        assignment={assignment}
        status={status}
      />
    </div>
  );
}

export function TasksView() {
  // Load live assignments (exclude done) using the custom hook
  const { assignments, loading, error, refreshAssignments, updateAssignment } = useAssignments(["todo", "in_progress", "review"]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [draggedAssignment, setDraggedAssignment] = useState<string | null>(null);
  
  // Debug logging and demo mode detection
  useEffect(() => {
    console.log('TasksView: assignments loaded', { assignments, loading, error });
    
    // Check if we're getting mock data (ids starting with 'mock-')
    if (assignments.length > 0 && assignments.some(a => a.id.startsWith('mock-'))) {
      setIsDemoMode(true);
    } else {
      setIsDemoMode(false);
    }
  }, [assignments, loading, error]);
  
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<"low" | "medium" | "high" | "critical" | "all">("all");
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);
  const [comment, setComment] = useState("");

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-700 border-gray-200";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "review": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "done": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getPriorityColor = (priority: Assignment['priority']) => {
    switch (priority) {
      case "low": return "bg-gray-100 text-gray-600";
      case "medium": return "bg-blue-100 text-blue-600";
      case "high": return "bg-orange-100 text-orange-600";
      case "critical": return "bg-red-100 text-red-600";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "todo": return <Clock className="h-4 w-4" />;
      case "in_progress": return <Play className="h-4 w-4" />;
      case "review": return <AlertCircle className="h-4 w-4" />;
      case "done": return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "To Do";
      case "in_progress": return "In Progress";
      case "review": return "Review";
      case "done": return "Done";
    }
  };

  // Memoize filtered tasks for performance
  const filteredTasks = React.useMemo(() => {
    return assignments.filter(assignment => {
      if (filterStatus !== "all" && assignment.status !== filterStatus) return false;
      if (filterPriority !== "all" && assignment.priority !== filterPriority) return false;
      return true;
    });
  }, [assignments, filterStatus, filterPriority]);

  // Memoize tasks by status for performance
  const tasksByStatus = React.useMemo(() => ({
    todo: filteredTasks.filter(t => t.status === "todo"),
    in_progress: filteredTasks.filter(t => t.status === "in_progress"),
    review: filteredTasks.filter(t => t.status === "review")
  }), [filteredTasks]);

  const totalTasks = filteredTasks.length;
  const todoTasks = tasksByStatus.todo.length;
  const inProgressTasks = tasksByStatus.in_progress.length;
  const reviewTasks = tasksByStatus.review.length;

  // Handle refresh functionality
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      refreshAssignments();
    } catch (err) {
      console.error('Failed to refresh assignments:', err);
    } finally {
      // Use setTimeout to ensure loading state shows for at least a brief moment
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Handle assignment drop between columns
  const handleAssignmentDrop = async (item: DragItem, targetStatus: TaskStatus) => {
    if (item.status === targetStatus) return;

    const assignmentToUpdate = assignments.find(a => a.id === item.id);
    if (!assignmentToUpdate) {
      console.error('Assignment not found for drag operation:', item.id);
      return;
    }

    console.log(`Moving assignment "${assignmentToUpdate.title}" from ${item.status} to ${targetStatus}`);
    
    try {
      // Set dragging state for visual feedback
      setDraggedAssignment(item.id);
      
      // Update the assignment status (and set waiting_on when moving to review)
      const updates: Partial<Assignment> = { status: targetStatus } as any;
      if (targetStatus === 'review') {
        const inferredReviewer = (assignmentToUpdate as any).waiting_on_name || assignmentToUpdate.assignees?.[0];
        if (inferredReviewer) {
          (updates as any).waiting_on_name = inferredReviewer;
        }
      }

      await updateAssignment(item.id, updates);
      
      console.log(`Successfully moved assignment to ${targetStatus}`);
      
      // Announce the change for screen readers
      const announcement = `Assignment "${assignmentToUpdate.title}" moved to ${formatStatus(targetStatus)}`;
      // Create a temporary element for screen reader announcement
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
      
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      
      // Show error notification
      const errorAnnouncement = `Failed to move assignment "${assignmentToUpdate.title}". Please try again.`;
      const errorAnnouncer = document.createElement('div');
      errorAnnouncer.setAttribute('aria-live', 'assertive');
      errorAnnouncer.setAttribute('aria-atomic', 'true');
      errorAnnouncer.className = 'sr-only';
      errorAnnouncer.textContent = errorAnnouncement;
      document.body.appendChild(errorAnnouncer);
      setTimeout(() => document.body.removeChild(errorAnnouncer), 1000);
      
    } finally {
      setDraggedAssignment(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + R to refresh
      if ((event.metaKey || event.ctrlKey) && event.key === 'r' && !isRefreshing) {
        event.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRefreshing]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Live Assignments</h1>
            <div className="text-muted-foreground">
              Active task management and progress tracking • Drag cards to change status
            </div>
            {isDemoMode && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                Demo Mode - Using sample data
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{todoTasks}</div>
                  <div className="text-sm text-muted-foreground">To Do</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{inProgressTasks}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{reviewTasks}</div>
                  <div className="text-sm text-muted-foreground">In Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 min-w-0" role="main" aria-label="Assignment Kanban Board">
          <div className="grid grid-cols-3 gap-6 h-full">
            {(["todo", "in_progress", "review"] as TaskStatus[]).map(status => (
              <section 
                key={status} 
                className="flex flex-col"
                aria-labelledby={`${status}-header`}
                aria-describedby={`${status}-description`}
              >
                <header className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <h2 id={`${status}-header`} className="font-medium">{formatStatus(status)}</h2>
                    <Badge variant="secondary" className="text-xs" aria-label={`${tasksByStatus[status].length} assignments`}>
                      {tasksByStatus[status].length}
                    </Badge>
                  </div>
                </header>

                <ColumnDropZone 
                  status={status} 
                  onDrop={handleAssignmentDrop}
                >
                  <div 
                    className="flex-1 space-y-3 min-h-0"
                    id={`${status}-description`}
                    aria-live="polite"
                    aria-label={`${formatStatus(status)} assignments list`}
                  >
                    <ScrollArea className="h-full">
                      <div className="space-y-3 pr-4 pb-4" role="list">
                        {loading ? (
                          <div className="text-center text-muted-foreground py-8">
                            <div className="animate-pulse space-y-3">
                              <div className="h-32 bg-muted rounded-2xl"></div>
                              <div className="h-32 bg-muted rounded-2xl"></div>
                              <div className="h-32 bg-muted rounded-2xl"></div>
                            </div>
                            <div className="mt-4">Loading assignments...</div>
                          </div>
                        ) : error ? (
                          <div className="text-center text-muted-foreground py-8">
                            <XCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
                            <div className="text-destructive mb-2">Failed to load assignments</div>
                            <div className="text-sm mb-4">{error}</div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleRefresh}
                              disabled={isRefreshing}
                            >
                              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                              Try Again
                            </Button>
                          </div>
                        ) : tasksByStatus[status].length === 0 ? (
                          <div className="text-center text-muted-foreground py-8 min-h-32 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted">
                            <div className="mb-2">Drop assignments here</div>
                            <div className="text-sm">
                              {status === 'todo' && 'Move tasks that need to be started'}
                              {status === 'in_progress' && 'Move tasks currently being worked on'}
                              {status === 'review' && 'Move tasks that need review'}
                            </div>
                          </div>
                        ) : (
                          tasksByStatus[status].map(assignment => (
                            <div key={assignment.id} role="listitem" className="relative">
                              <DraggableAssignmentCard
                                assignment={assignment}
                                status={status}
                                isDragging={draggedAssignment === assignment.id}
                              />
                              {draggedAssignment === assignment.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm z-10">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Updating...
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </ColumnDropZone>
              </section>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}