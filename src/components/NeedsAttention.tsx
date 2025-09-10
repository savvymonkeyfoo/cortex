import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AccentCard } from "./AccentCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { severityTokens, toSeverity, type Severity } from "../lib/status-theme";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowUp, 
  UserPlus, 
  User,
  Eye,
  MessageSquare,
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

// Chat Messages Component with Mira styling
function ChatMessages({ messages, className = "" }: { messages: Array<{id: string; sender: 'user' | 'agent'; message: string; timestamp: string;}>, className?: string }) {
  return (
    <div className={`flex-1 overflow-auto p-4 space-y-4 ${className.includes('bg-transparent') ? 'bg-transparent' : 'bg-white rounded-lg'} ${className}`}>
      {messages.map((message) => (
        <div key={message.id} className={`space-y-1 group`}>
          <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              message.sender === 'agent' 
                ? '' 
                : 'bg-muted/60 rounded-lg p-3'
            }`}>
            <p className={`text-sm ${
              message.sender === 'agent' 
                ? 'text-foreground' 
                : 'text-foreground'
            }`}>
              {message.message}
            </p>
            </div>
          </div>
          
          {/* Message Action Icons - Below conversation area */}
          <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {message.sender === 'agent' ? (
                // Agent message icons
                <>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Like"
                    aria-label="Like"
                  >
                    <ThumbsUp className="w-3 h-3 text-muted-foreground hover:text-ai-success" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Dislike"
                    aria-label="Dislike"
                  >
                    <ThumbsDown className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Copy"
                    aria-label="Copy"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground hover:text-ai-primary" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Bookmark"
                    aria-label="Bookmark"
                  >
                    <Bookmark className="w-3 h-3 text-muted-foreground hover:text-ai-accent" />
                  </button>
                </>
              ) : (
                // User message icons
                <>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Edit className="w-3 h-3 text-muted-foreground hover:text-ai-secondary" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Copy"
                    aria-label="Copy"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground hover:text-ai-primary" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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

const mockTriageItems: TriageItem[] = [
  {
    id: "1",
    title: "Auto-scale database cluster during peak traffic",
    type: "Requesting Approval",
    agent: "AutoScaler-v2.1",
    summary: "Recommending scale-up of database cluster from 3 to 6 nodes due to 85% CPU utilization",
    autonomyLevel: "Medium",
    confidence: 92,
    provenance: ["CloudWatch", "Prometheus", "Historical Data"],
    due: "15m",
    assignee: "Sarah Chen",
    risk: "Medium",
    source: "Infrastructure Monitor",
    recommendation: "Scale database cluster from 3 to 6 nodes immediately to handle peak traffic load",
    rationale: "CPU utilization has exceeded 85% threshold for 10+ minutes. Historical data shows similar patterns require scaling to maintain SLA compliance.",
    impact: "Cost increase: $450/hour. Performance improvement: 40% faster query times. Risk mitigation: Prevents potential service degradation.",
    simulation: "Simulated load test shows 99.8% uptime with proposed scaling vs 94% without scaling",
    approvalChain: ["AutoScaler-v2.1", "Sarah Chen", "Mike Rodriguez"],
    comments: [
      { author: "AutoScaler-v2.1", text: "High confidence recommendation based on traffic patterns", time: "2m ago" },
      { author: "Sarah Chen", text: "Looks good, cost impact is acceptable for peak hours", time: "1m ago" }
    ],
    citations: [
      { id: "c1", title: "CloudWatch CPU Metrics - DB Cluster 03", type: "metrics", url: "/metrics/cloudwatch/db-cluster-03", timestamp: "10m ago" },
      { id: "c2", title: "Prometheus Query Results - CPU Utilization", type: "database", url: "/prometheus/cpu-utilization", timestamp: "8m ago" },
      { id: "c3", title: "Historical Scaling Patterns Analysis", type: "pdf", url: "/reports/scaling-patterns-2024.pdf" },
      { id: "c4", title: "Application Server Logs - Peak Hours", type: "log", url: "/logs/app-server/peak-hours", timestamp: "15m ago" }
    ]
  },
  {
    id: "2",
    title: "Critical security patch deployment",
    type: "Requesting Approval",
    agent: "SecurityBot-v1.3",
    summary: "Deploy critical CVE-2024-1234 patch to all production servers within maintenance window",
    autonomyLevel: "Low",
    confidence: 78,
    provenance: ["CVE Database", "Security Scanner", "Vendor Advisory"],
    due: "2h",
    assignee: "Lisa Park",
    risk: "Critical",
    source: "Security Monitor",
    recommendation: "Deploy security patch CVE-2024-1234 to all production servers during next maintenance window",
    rationale: "Critical vulnerability affects authentication system. Zero-day exploit detected in the wild. Vendor recommends immediate patching.",
    impact: "Security risk mitigation: Eliminates critical auth bypass vulnerability. Deployment time: 45 minutes. Service downtime: <5 minutes per server.",
    approvalChain: ["SecurityBot-v1.3", "Lisa Park", "Security Team Lead"],
    comments: [
      { author: "SecurityBot-v1.3", text: "Critical severity - immediate action required", time: "15m ago" },
      { author: "Security Scanner", text: "Vulnerability confirmed across 12 production servers", time: "10m ago" }
    ],
    citations: [
      { id: "c5", title: "CVE-2024-1234 Vulnerability Report", type: "security", url: "/security/cve-2024-1234" },
      { id: "c6", title: "Vendor Security Advisory - Critical Update", type: "pdf", url: "/security/vendor-advisory.pdf" },
      { id: "c7", title: "Production Server Scan Results", type: "log", url: "/security/scan-results", timestamp: "20m ago" },
      { id: "c8", title: "Patch Management Confluence Page", type: "confluence", url: "/confluence/patch-management" }
    ]
  },
  {
    id: "3",
    title: "Production API rate limit breach detected",
    type: "Exception",
    agent: "MonitorBot-v2.0",
    summary: "API rate limits exceeded by 400% on payment processing endpoint, causing service degradation",
    autonomyLevel: "High",
    confidence: 95,
    provenance: ["API Gateway", "CloudWatch", "Application Logs"],
    due: "30m",
    assignee: "Mike Rodriguez",
    risk: "Critical",
    source: "API Monitor",
    recommendation: "Immediately increase API rate limits for payment processing endpoint and implement emergency throttling",
    rationale: "Payment processing is business critical. Current rate limits are insufficient for Black Friday traffic surge. Service degradation is affecting customer transactions.",
    impact: "Revenue impact: $50,000/hour in lost transactions. Customer satisfaction: Critical impact on checkout process. SLA breach: 99.9% uptime requirement violated.",
    simulation: "Traffic modeling shows 600% capacity needed for next 4 hours based on historical Black Friday patterns",
    approvalChain: ["MonitorBot-v2.0", "Mike Rodriguez", "Engineering Director"],
    comments: [
      { author: "MonitorBot-v2.0", text: "Emergency threshold breach - immediate intervention required", time: "5m ago" },
      { author: "Payment Team", text: "Customer complaints increasing rapidly", time: "3m ago" }
    ],
    citations: [
      { id: "c9", title: "API Gateway Rate Limit Metrics", type: "metrics", url: "/monitoring/api-gateway/rate-limits", timestamp: "5m ago" },
      { id: "c10", title: "Payment Processing Error Logs", type: "log", url: "/logs/payment-processor/errors", timestamp: "8m ago" },
      { id: "c11", title: "Black Friday Traffic Analysis", type: "pdf", url: "/reports/black-friday-traffic-2024.pdf" },
      { id: "c12", title: "SLA Monitoring Dashboard", type: "metrics", url: "/dashboards/sla-monitoring", timestamp: "2m ago" }
    ]
  }
];

interface NeedsAttentionProps {
  onConsultPanelChange?: (isOpen: boolean) => void;
}

export function NeedsAttention({ onConsultPanelChange }: NeedsAttentionProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [consultPanelItemId, setConsultPanelItemId] = useState<string | null>(null);
  const [consultMessage, setConsultMessage] = useState("");
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false);
  const [requestChangesItemId, setRequestChangesItemId] = useState<string | null>(null);
  const [requestChangesMessage, setRequestChangesMessage] = useState("");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const expandedCardRef = useRef<HTMLDivElement>(null);
  const [triageItems, setTriageItems] = useState(mockTriageItems);
  
  // Current logged-in user (in a real app, this would come from auth context)
  const currentUser = "Sarah Chen";
  
  // Available assignees for the dropdown
  const availableAssignees = [
    "Lisa Park",
    "Sarah Chen", 
    "Mike Rodriguez",
    "Alex Thompson",
    "Emma Wilson",
    "David Kim"
  ];

  // Filter only critical items for Needs Attention
  const criticalItems = triageItems.filter(item => item.risk === "Critical");

  // Mock chat messages for the consult panel
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'agent';
    message: string;
    timestamp: string;
  }>>([
    {
      id: '1',
      sender: 'agent',
      message: 'Hello! I\'m here to help you with this critical issue. What specific concerns do you have about this recommendation?',
      timestamp: '2m ago'
    }
  ]);

  // Mock chat messages for the request changes modal
  const [requestChangesChat, setRequestChangesChat] = useState<Array<{
    id: string;
    sender: 'user' | 'agent';
    message: string;
    timestamp: string;
  }>>([
    {
      id: '1',
      sender: 'agent',
      message: 'I understand you\'d like to request changes to this recommendation. Please describe what modifications you\'d like me to make.',
      timestamp: 'Just now'
    }
  ]);

  // Handle consult panel state changes
  const handleConsultPanelChange = (itemId: string | null) => {
    setConsultPanelItemId(itemId);
    if (onConsultPanelChange) {
      onConsultPanelChange(itemId !== null);
    }
  };

  const handleSendMessage = () => {
    if (consultMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user' as const,
        message: consultMessage,
        timestamp: 'Just now'
      };
      setChatMessages(prev => [...prev, newMessage]);
      setConsultMessage("");
      
      // Simulate agent response
      setTimeout(() => {
        const agentResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'agent' as const,
          message: 'I understand your concern. Based on the current metrics, this action is recommended because...',
          timestamp: 'Just now'
        };
        setChatMessages(prev => [...prev, agentResponse]);
      }, 1000);
    }
  };

  const handleRequestChangesMessage = () => {
    if (requestChangesMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user' as const,
        message: requestChangesMessage,
        timestamp: 'Just now'
      };
      setRequestChangesChat(prev => [...prev, newMessage]);
      setRequestChangesMessage("");
      
      // Simulate agent response
      setTimeout(() => {
        const agentResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'agent' as const,
          message: 'Thank you for the feedback. I can adjust the recommendation to address your concerns. Would you like me to proceed with these changes?',
          timestamp: 'Just now'
        };
        setRequestChangesChat(prev => [...prev, agentResponse]);
      }, 1000);
    }
  };

  const handleSubmitRequestedChanges = () => {
    if (requestChangesItemId) {
      // Update the item with a note about requested changes
      setTriageItems(prev => prev.map(item => {
        if (item.id === requestChangesItemId) {
          const updatedItem = {
            ...item,
            comments: [
              ...item.comments,
              {
                author: currentUser,
                text: `Requested changes: ${requestChangesChat.find(msg => msg.sender === 'user')?.message || 'Changes requested via chat'}`,
                time: 'Just now'
              }
            ]
          };
          return updatedItem;
        }
        return item;
      }));
    }
    
    // Close modal and reset state
    setRequestChangesModalOpen(false);
    setRequestChangesItemId(null);
    setRequestChangesChat([{
      id: '1',
      sender: 'agent',
      message: 'I understand you\'d like to request changes to this recommendation. Please describe what modifications you\'d like me to make.',
      timestamp: 'Just now'
    }]);
  };

  const handleAddComment = (itemId: string) => {
    const commentText = newComments[itemId]?.trim();
    if (commentText) {
      setTriageItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            comments: [
              ...item.comments,
              {
                author: currentUser,
                text: commentText,
                time: 'Just now'
              }
            ]
          };
          return updatedItem;
        }
        return item;
      }));
      
      // Clear the input for this item
      setNewComments(prev => ({
        ...prev,
        [itemId]: ''
      }));
    }
  };

  const handleAssigneeChange = (itemId: string, newAssignee: string) => {
    setTriageItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          assignee: newAssignee,
          comments: [
            ...item.comments,
            {
              author: currentUser,
              text: `Assignee changed to ${newAssignee}`,
              time: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
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
    <div className="w-full flex h-full">
      {/* Main Content */}
      <div className={`w-full flex flex-col transition-all duration-300 ${consultPanelItemId ? 'w-1/2' : 'w-full'}`}>
        <Card className="w-full h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Needs Attention
              </CardTitle>
              <Badge variant="destructive" className="text-sm">
                {criticalItems.length} critical
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="space-y-3 p-6 pt-0 h-full overflow-auto">
              {criticalItems.map((item) => {
                const isExpanded = expandedItemId === item.id;
                return (
                  <AccentCard 
                    key={item.id} 
                    ref={isExpanded ? expandedCardRef : null}
                    tone="severity"
                    statusKey={toSeverity(item.risk)}
                    active={isExpanded}
                    dim={!!(expandedItemId && expandedItemId !== item.id) || !!(consultPanelItemId && consultPanelItemId !== item.id)}
                    className={`transition-all duration-300 ${
                      isExpanded 
                        ? 'shadow-xl z-10' 
                        : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isExpanded) {
                        // Close consult panel when expanding a different card
                        if (consultPanelItemId && consultPanelItemId !== item.id) {
                          handleConsultPanelChange(null);
                        }
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
                                className={`text-xs ${
                                  expandedItemId && !isExpanded ? 'opacity-60' : ''
                                }`}
                              >
                                {item.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${severityTokens[toSeverity(item.risk)].badge} ${
                                  expandedItemId && !isExpanded ? 'opacity-60' : ''
                                }`}
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
                                  if (!isExpanded) {
                                    // Close consult panel when expanding a different card via Details button
                                    if (consultPanelItemId && consultPanelItemId !== item.id) {
                                      handleConsultPanelChange(null);
                                    }
                                  }
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
                            <div className="mt-6 pt-6 border-t space-y-6 animate-in slide-in-from-top-5 duration-300">
                              {/* Quick Actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 border-ai-primary text-[rgba(190,56,169,1)] hover:bg-ai-primary hover:text-gray-900 hover-glow"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRequestChangesItemId(item.id);
                                      setRequestChangesModalOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Request Changes
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <User className="h-3 w-3 mr-1" />
                                        Assignee: {item.assignee}
                                        <ChevronDown className="h-3 w-3 ml-1" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48">
                                      {availableAssignees.map((assignee) => (
                                        <DropdownMenuItem 
                                          key={assignee}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAssigneeChange(item.id, assignee);
                                          }}
                                          className={item.assignee === assignee ? "bg-muted" : ""}
                                        >
                                          <User className="mr-2 h-4 w-4" />
                                          {assignee}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConsultPanelChange(consultPanelItemId === item.id ? null : item.id);
                                    }}
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {consultPanelItemId === item.id ? 'Close Chat' : 'Consult Agent'}
                                  </Button>
                                </div>
                              </div>

                              {/* Details Content - Three column layout for main content */}
                              <div className="space-y-6">
                                {/* Main Content - Three Column Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Recommendation</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                      {item.recommendation}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Rationale</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                      {item.rationale}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Impact Analysis</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                      {item.impact}
                                    </p>
                                  </div>
                                </div>

                                {/* Simulation Results - Full width if it exists */}
                                {item.simulation && (
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Simulation Results</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                      {item.simulation}
                                    </p>
                                  </div>
                                )}

                                {/* Single Column Layout for Approval Chain, Sources, and Comments */}
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Approval Chain</h4>
                                    <div className="flex flex-col gap-2">
                                      {item.approvalChain.map((approver, index) => (
                                        <div key={index} className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-xs">
                                            {approver}
                                          </Badge>
                                          {index < item.approvalChain.length - 1 && (
                                            <ArrowUp className="h-3 w-3 text-muted-foreground rotate-90" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Sources</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                      {item.citations.map((citation) => (
                                        <CitationTile key={citation.id} citation={citation} />
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm mb-2">Comments</h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {item.comments.map((comment, index) => (
                                        <div key={index} className="bg-muted/50 p-2 rounded text-xs">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{comment.author}</span>
                                            <span className="text-muted-foreground">{comment.time}</span>
                                          </div>
                                          <p className="text-muted-foreground">{comment.text}</p>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Add Comment Input */}
                                    <div className="flex gap-2 mt-2">
                                      <Input 
                                        placeholder="Add a comment..." 
                                        value={newComments[item.id] || ''}
                                        onChange={(e) => setNewComments(prev => ({
                                          ...prev,
                                          [item.id]: e.target.value
                                        }))}
                                        className="text-xs"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddComment(item.id);
                                          }
                                        }}
                                      />
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleAddComment(item.id)}
                                        disabled={!newComments[item.id]?.trim()}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </AccentCard>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Request Changes Modal with enhanced styling */}
        <Dialog open={requestChangesModalOpen} onOpenChange={setRequestChangesModalOpen}>
          <DialogContent className="!max-w-[80vw] w-[70vw] p-0 gap-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-gradient-ai-primary p-6 relative overflow-hidden -m-px rounded-t-[calc(1rem-1px)]">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-t-2xl" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-glow opacity-20 blur-3xl" />
              
              <DialogHeader className="space-y-4 relative z-10 bg-[rgba(255,255,255,0)]">
                <DialogTitle className="flex items-center gap-4 text-white text-2xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  Request Changes
                </DialogTitle>
                <DialogDescription className="text-white/90 text-base">
                  Collaborate with the AI agent to refine and improve this recommendation through an interactive conversation.
                </DialogDescription>

                {requestChangesItemId && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mt-4 border border-white/20 shadow-lg">
                    <div className="text-base text-[rgba(255,255,255,1)] font-semibold">
                      Requesting changes for: {triageItems.find(item => item.id === requestChangesItemId)?.title}
                    </div>
                  </div>
                )}
              </DialogHeader>
            </div>
            
            <div className="flex flex-col h-[40rem] p-10 gap-8 bg-background-subtle">
              {/* Chat Messages with enhanced styling */}
              <div className="flex-1 bg-white rounded-2xl border border-border p-8 overflow-hidden shadow-lg">
                <ChatMessages messages={requestChangesChat} className="h-full bg-transparent p-0" />
              </div>
              
              {/* Input Section with premium styling */}
              <div className="flex gap-6 items-end p-6 bg-white rounded-2xl border border-border shadow-lg">
                <div className="flex-1">
                  <Textarea
                    placeholder="Describe the changes you'd like to request..."
                    value={requestChangesMessage}
                    onChange={(e) => setRequestChangesMessage(e.target.value)}
                    className="min-h-[100px] resize-none border-border-strong bg-white focus:border-ai-primary focus:ring-ai-primary/20 text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRequestChangesMessage();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleRequestChangesMessage}
                  disabled={!requestChangesMessage.trim()}
                  size="lg"
                  className="h-14 px-8 bg-ai-primary hover:bg-ai-primary/90 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 hover-glow"
                >
                  <Send className="h-5 w-5 mr-3" />
                  Send
                </Button>
              </div>
              
              {/* Action Buttons with enhanced styling */}
              <div className="flex justify-between items-center pt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => setRequestChangesModalOpen(false)}
                  className="px-10 h-12 border-border-strong hover:bg-muted text-base font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitRequestedChanges}
                  className="px-10 h-12 bg-ai-accent hover:bg-ai-accent/90 text-white shadow-lg hover:shadow-xl hover-glow transition-all duration-200 text-base font-medium"
                >
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Submit Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Consult Panel - Right Side */}
      {consultPanelItemId && (
        <div className="w-1/2 border-l border-border bg-background-elevated flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="p-4 border-b border-border bg-gradient-ai-primary flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-white" />
                <h3 className="font-medium text-white">Agent Consultation</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleConsultPanelChange(null)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-white/80 mt-1">
              Discussing: {triageItems.find(item => item.id === consultPanelItemId)?.title}
            </p>
          </div>

          <div className="flex-1 flex flex-col p-4 gap-4 min-h-0">
            {/* Chat Messages */}
            <div className="flex-1 bg-white rounded-lg border border-border overflow-hidden min-h-0">
              <ChatMessages messages={chatMessages} className="h-full" />
            </div>
            
            {/* Input */}
            <div className="flex gap-2 flex-shrink-0">
              <Input 
                placeholder="Ask the agent about this recommendation..." 
                value={consultMessage}
                onChange={(e) => setConsultMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!consultMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}