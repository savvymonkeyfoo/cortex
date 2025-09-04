import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useTriageAssignments } from "../hooks/useTriageAssignments";
import type { TriageAssignment, TriageType, RiskLevel } from "../types/assignment";
import { 
  Filter, 
  Search, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowUp, 
  UserPlus, 
  Pause,
  Eye,
  MessageSquare,
  GitBranch,
  ArrowUpDown,
  FileText,
  Database,
  Globe,
  BarChart3,
  Shield,
  ExternalLink,
  Send,
  X,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Bookmark,
  Edit,
  Trash2,
  ChevronDown
} from "lucide-react";

// Citation Tile Component
function CitationTile({ citation }: { citation: any }) {
  const getIconForType = (type: string) => {
    switch (type) {
      case "log": return <FileText className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "confluence": return <Globe className="h-4 w-4" />;
      case "metrics": return <BarChart3 className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "database": return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-auto p-3 justify-start text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {getIconForType(citation.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs truncate">{citation.title}</div>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs bg-ai-secondary-accessible">{citation.type}</Badge>
            {citation.timestamp && (
              <span className="text-xs text-muted-foreground">{citation.timestamp}</span>
            )}
          </div>
        </div>
        <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />
      </div>
    </Button>
  );
}

// Helper function to convert database DBRow to legacy TriageItem format
function convertDBRowToTriageItem(dbRow: any): TriageItem {
  // Create demo data for triage items since we're getting simplified DBRow format
  return {
    id: dbRow.id || dbRow.assignment_id,
    title: dbRow.title || "Triage Item",
    type: "Requesting Approval" as const,
    agent: "System",
    summary: `Review required for: ${dbRow.title || "assignment"}`,
    autonomyLevel: "Medium" as const,
    confidence: 85,
    provenance: ["System Monitor"],
    due: "N/A",
    assignee: dbRow.assignees?.[0] || 'Unassigned',
    risk: "Medium" as const,
    source: "System",
    recommendation: "Review and take appropriate action",
    rationale: "Item requires manual review",
    impact: "Standard operational impact",
    simulation: null,
    approvalChain: ["System", dbRow.assignees?.[0] || "Operator"],
    comments: [],
    citations: []
  };
}

interface TriageItem {
  id: string;
  title: string;
  type: "Requesting Approval" | "Exception" | "FYI";
  agent: string;
  summary: string;
  autonomyLevel: "High" | "Medium" | "Low";
  confidence: number;
  provenance: string[];
  due: string;
  assignee: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  source: string;
  recommendation: string;
  rationale: string;
  impact: string;
  simulation?: string;
  approvalChain: string[];
  comments: Array<{ author: string; text: string; time: string }>;
  citations: Array<{
    id: string;
    title: string;
    type: "log" | "pdf" | "confluence" | "metrics" | "security" | "database";
    url: string;
    timestamp?: string;
  }>;
}

export function TriageView() {
  // Use the new triage assignments hook
  const { 
    assignments: dbAssignments, 
    loading, 
    error,
    addComment,
    updateAssignmentStatus,
    source
  } = useTriageAssignments();

  // Convert database assignments to legacy format for UI compatibility
  // Filter for review-like statuses
  const reviewAssignments = dbAssignments.filter(assignment => 
    ['review', 'awaiting_review', 'needs_review', 'waiting_review'].includes(assignment.status)
  );
  const triageItems = reviewAssignments.map(convertDBRowToTriageItem);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("risk");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const expandedCardRef = useRef<HTMLDivElement>(null);
  
  // Current logged-in user (in a real app, this would come from auth context)
  const currentUser = "Sarah Chen";

  const [filters, setFilters] = useState({
    type: "All",
    risk: "All",
    owner: "All",
    due: "All",
    source: "All",
    agent: "All"
  });

  const handleAddComment = async (itemId: string) => {
    const commentText = newComments[itemId]?.trim();
    if (commentText) {
      try {
        await addComment(itemId, currentUser, commentText);
        // Clear the input for this item
        setNewComments(prev => ({
          ...prev,
          [itemId]: ''
        }));
      } catch (error) {
        console.error('Failed to add comment:', error);
        // Could show a toast error here
      }
    }
  };

  const filteredAndSortedItems = triageItems
    .filter(item => {
      // Apply filter criteria
      if (filters.type !== "All" && item.type !== filters.type) return false;
      if (filters.risk !== "All" && item.risk !== filters.risk) return false;
      if (filters.owner !== "All" && item.assignee !== filters.owner) return false;
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.title.toLowerCase().includes(searchLower) ||
          item.summary.toLowerCase().includes(searchLower) ||
          item.agent.toLowerCase().includes(searchLower) ||
          item.assignee.toLowerCase().includes(searchLower) ||
          item.source.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "none") return 0;
      
      if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      }
      
      if (sortBy === "risk") {
        const riskOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
        return riskOrder[a.risk as keyof typeof riskOrder] - riskOrder[b.risk as keyof typeof riskOrder];
      }
      
      if (sortBy === "owner") {
        return a.assignee.localeCompare(b.assignee);
      }
      
      return 0;
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "#ef4444";
      case "High": return "#f97316";
      case "Medium": return "#eab308";
      case "Low": return "#22c55e";
      default: return "#6b7280";
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "Requesting Approval": return "destructive";
      case "Exception": return "secondary";
      case "FYI": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-brand-primary" />
              Triage
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredAndSortedItems.length} items
              </Badge>
              {/* Show demo indicator when using mock data */}
              {source === "demo" && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Demo Data
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Filters Bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Requesting Approval">Requesting Approval</SelectItem>
                <SelectItem value="Exception">Exception</SelectItem>
                <SelectItem value="FYI">FYI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.risk} onValueChange={(value) => setFilters({...filters, risk: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Risk</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.owner} onValueChange={(value) => setFilters({...filters, owner: value})}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Owners</SelectItem>
                <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                <SelectItem value="Lisa Park">Lisa Park</SelectItem>
                <SelectItem value="Mike Rodriguez">Mike Rodriguez</SelectItem>
                <SelectItem value="Automated">Automated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort:</span>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sort</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
                <SelectItem value="risk">By Risk</SelectItem>
                <SelectItem value="owner">By Owner</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-48" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-6 pt-0 overflow-auto">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading triage assignments...
              </div>
              <p className="text-xs">Connecting to Supabase database...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-destructive mb-2">Database Connection Issue</h4>
                  <p className="text-sm text-destructive/80 mb-3">{error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Retry Connection
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Note:</strong> Demo data is currently being displayed below. 
                    The database may need to be set up or RLS policies may need to be configured.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    In development, this is expected behavior when the database is not yet configured.
                  </p>
                </div>
              </div>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No triage assignments found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedItems.map((item) => {
                const isExpanded = expandedItemId === item.id;
                return (
                  <Card 
                    key={item.id} 
                    ref={isExpanded ? expandedCardRef : null}
                    className={`border-l-4 transition-all duration-300 ${
                      isExpanded 
                        ? 'shadow-xl z-10' 
                        : 'cursor-pointer dynamic-card-hover'
                    }`}
                    style={{ 
                      borderLeftColor: getRiskColor(item.risk),
                      '--hover-border-color': getRiskColor(item.risk)
                    } as React.CSSProperties}
                    onClick={() => {
                      if (!isExpanded) {
                        setExpandedItemId(item.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{item.title}</h3>
                              <Badge 
                                variant={getTypeVariant(item.type)} 
                                className="text-xs"
                              >
                                {item.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {item.risk} Risk
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.due !== "N/A" && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {item.due}
                                </div>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedItemId(isExpanded ? null : item.id);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">{item.summary}</p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Agent: {item.agent}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Autonomy: </span>
                                <Badge variant="outline" className="text-xs">
                                  {item.autonomyLevel}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Confidence: {item.confidence}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Assignee: {item.assignee}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {item.provenance.map((source, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-ai-secondary-accessible">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t space-y-6">
                              {/* Recommendation Section */}
                              <div>
                                <h4 className="font-medium mb-2">Recommendation</h4>
                                <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                              </div>

                              {/* Rationale Section */}
                              <div>
                                <h4 className="font-medium mb-2">Rationale</h4>
                                <p className="text-sm text-muted-foreground">{item.rationale}</p>
                              </div>

                              {/* Impact Section */}
                              <div>
                                <h4 className="font-medium mb-2">Impact</h4>
                                <p className="text-sm text-muted-foreground">{item.impact}</p>
                              </div>

                              {/* Simulation Section */}
                              {item.simulation && (
                                <div>
                                  <h4 className="font-medium mb-2">Simulation</h4>
                                  <p className="text-sm text-muted-foreground">{item.simulation}</p>
                                </div>
                              )}

                              {/* Citations Section */}
                              {item.citations.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">Sources</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {item.citations.map((citation) => (
                                      <CitationTile key={citation.id} citation={citation} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Comments Section */}
                              <div>
                                <h4 className="font-medium mb-3">Comments</h4>
                                <div className="space-y-3">
                                  {item.comments.map((comment, index) => (
                                    <div key={index} className="bg-muted/50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                                      </div>
                                      <p className="text-sm">{comment.text}</p>
                                    </div>
                                  ))}

                                  {/* Add Comment Input */}
                                  <div className="flex gap-2">
                                    <Textarea
                                      placeholder="Add a comment..."
                                      value={newComments[item.id] || ''}
                                      onChange={(e) => setNewComments(prev => ({
                                        ...prev,
                                        [item.id]: e.target.value
                                      }))}
                                      className="flex-1"
                                      rows={2}
                                    />
                                    <Button 
                                      onClick={() => handleAddComment(item.id)}
                                      disabled={!newComments[item.id]?.trim()}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-4 border-t">
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle approve action
                                    updateAssignmentStatus(item.id, 'done');
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle reject action
                                    updateAssignmentStatus(item.id, 'todo');
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle request changes
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Request Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}