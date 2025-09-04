import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
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
  ExternalLink
} from "lucide-react";

interface InboxItem {
  id: string;
  title: string;
  type: "Approval" | "Exception" | "FYI";
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

const mockInboxItems: InboxItem[] = [
  {
    id: "1",
    title: "Auto-scale database cluster during peak traffic",
    type: "Approval",
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
    type: "Approval",
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
    title: "Unusual API traffic pattern detected",
    type: "Exception",
    agent: "AnomalyDetector-v3.0",
    summary: "API endpoint /auth/login showing 300% traffic increase from unknown IP ranges",
    autonomyLevel: "High",
    confidence: 89,
    provenance: ["Traffic Analytics", "GeoIP", "Rate Limiter"],
    due: "30m",
    assignee: "Mike Rodriguez",
    risk: "High",
    source: "Traffic Monitor",
    recommendation: "Implement temporary rate limiting on /auth/login endpoint and investigate traffic source",
    rationale: "Traffic spike pattern matches potential credential stuffing attack. IP geolocation shows suspicious distribution across multiple countries.",
    impact: "Security improvement: Prevents potential account compromise. User impact: Legitimate users may experience slight login delays.",
    approvalChain: ["AnomalyDetector-v3.0", "Mike Rodriguez"],
    comments: [
      { author: "AnomalyDetector-v3.0", text: "Pattern matches known attack signatures", time: "5m ago" }
    ],
    citations: [
      { id: "c9", title: "API Gateway Access Logs", type: "log", url: "/logs/api-gateway/access", timestamp: "5m ago" },
      { id: "c10", title: "Traffic Analytics Dashboard", type: "metrics", url: "/analytics/traffic-patterns" },
      { id: "c11", title: "GeoIP Lookup Results", type: "database", url: "/security/geoip-analysis", timestamp: "3m ago" },
      { id: "c12", title: "Rate Limiting Configuration Guide", type: "confluence", url: "/confluence/rate-limiting" }
    ]
  },
  {
    id: "4",
    title: "Database backup verification completed",
    type: "FYI",
    agent: "BackupValidator-v1.2",
    summary: "Daily backup verification completed successfully with 100% data integrity",
    autonomyLevel: "High",
    confidence: 100,
    provenance: ["Backup System", "Checksum Validator", "Recovery Test"],
    due: "N/A",
    assignee: "Automated",
    risk: "Low",
    source: "Backup Monitor",
    recommendation: "No action required - backup verification passed all checks",
    rationale: "All backup files verified with successful checksum validation and recovery test completed within SLA timeframes.",
    impact: "Data protection: All critical data successfully backed up. Recovery capability confirmed.",
    approvalChain: ["BackupValidator-v1.2"],
    comments: [
      { author: "BackupValidator-v1.2", text: "All verification checks passed", time: "1h ago" }
    ],
    citations: [
      { id: "c13", title: "Backup Verification Report", type: "pdf", url: "/backups/verification-report.pdf" },
      { id: "c14", title: "Database Backup Logs", type: "log", url: "/logs/backup-system", timestamp: "1h ago" },
      { id: "c15", title: "Recovery Test Results", type: "metrics", url: "/backups/recovery-test-metrics" },
      { id: "c16", title: "Backup Policy Documentation", type: "confluence", url: "/confluence/backup-policies" }
    ]
  }
];

export function InboxView() {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const expandedCardRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    type: "All",
    risk: "All",
    owner: "All",
    due: "All",
    source: "All",
    agent: "All"
  });

  // Click outside to close expanded card
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (expandedCardRef.current && !expandedCardRef.current.contains(event.target as Node)) {
        setExpandedItemId(null);
      }
    }

    if (expandedItemId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [expandedItemId]);

  const filteredAndSortedItems = mockInboxItems
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
      case "Approval": return "destructive";
      case "Exception": return "secondary";
      case "FYI": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="border-b pl-6 py-6 pr-0">
        <div className="flex items-center justify-between mb-4 pr-6">
          <h1 className="text-2xl font-medium">Inbox</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Batch Approve Low-Risk
            </Button>
            <Badge variant="secondary" className="text-sm">
              {filteredAndSortedItems.length} items
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap pr-6">
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
              <SelectItem value="Approval">Approval</SelectItem>
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
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-3">
          {filteredAndSortedItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <Card 
                key={item.id} 
                ref={isExpanded ? expandedCardRef : null}
                className={`border-l-4 transition-all duration-300 ${
                  isExpanded 
                    ? 'shadow-xl' 
                    : 'cursor-pointer dynamic-card-hover'
                }`}
                style={{ 
                  borderLeftColor: getRiskColor(item.risk),
                  '--hover-border-color': getRiskColor(item.risk)
                } as React.CSSProperties}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant={getTypeVariant(item.type)} className="text-xs">
                            {item.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
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
                            <Badge key={index} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t space-y-6 animate-in slide-in-from-top-5 duration-300">
                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle className="h-3 w-3 mr-1" />
                              Request Changes
                            </Button>
                            <Button size="sm" variant="outline">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              Escalate
                            </Button>
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pause className="h-3 w-3 mr-1" />
                              Snooze
                            </Button>
                          </div>

                          <Separator />

                          {/* Recommendation */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Recommendation</h4>
                            <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                          </div>

                          {/* Rationale */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Rationale</h4>
                            <p className="text-sm text-muted-foreground">{item.rationale}</p>
                          </div>

                          {/* Sources & Citations */}
                          <div className="space-y-3">
                            <h4 className="font-medium">Sources & Citations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {item.citations.map((citation) => (
                                <CitationTile key={citation.id} citation={citation} />
                              ))}
                            </div>
                          </div>

                          {/* Impact */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Impact Analysis</h4>
                            <p className="text-sm text-muted-foreground">{item.impact}</p>
                          </div>

                          {/* Simulation */}
                          {item.simulation && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Simulation Results</h4>
                              <p className="text-sm text-muted-foreground">{item.simulation}</p>
                            </div>
                          )}

                          {/* Approval Chain */}
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <GitBranch className="h-4 w-4" />
                              Approval Chain
                            </h4>
                            <div className="space-y-2">
                              {item.approvalChain.map((approver, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span>{approver}</span>
                                  {index === 0 && <Badge variant="secondary" className="text-xs">Initiator</Badge>}
                                  {index === item.approvalChain.length - 1 && <Badge variant="outline" className="text-xs">Final Approver</Badge>}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Comments */}
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Comments ({item.comments.length})
                            </h4>
                            <div className="space-y-3">
                              {item.comments.map((comment, index) => (
                                <div key={index} className="bg-muted rounded-lg p-3 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                                  </div>
                                  <p className="text-sm">{comment.text}</p>
                                </div>
                              ))}
                            </div>
                            
                            {/* Add Comment */}
                            <div className="space-y-2 pt-2">
                              <Textarea placeholder="Add a comment..." className="min-h-[80px]" />
                              <Button size="sm">Post Comment</Button>
                            </div>
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
      </div>
    </div>
  );
}

function CitationTile({ citation }: { citation: { id: string; title: string; type: string; url: string; timestamp?: string } }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "log":
        return <FileText className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "confluence":
        return <Globe className="h-4 w-4" />;
      case "metrics":
        return <BarChart3 className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "log":
        return "text-blue-600 dark:text-blue-400";
      case "pdf":
        return "text-red-600 dark:text-red-400";
      case "confluence":
        return "text-purple-600 dark:text-purple-400";
      case "metrics":
        return "text-green-600 dark:text-green-400";
      case "security":
        return "text-orange-600 dark:text-orange-400";
      case "database":
        return "text-indigo-600 dark:text-indigo-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "log":
        return "Logs";
      case "pdf":
        return "PDF";
      case "confluence":
        return "Wiki";
      case "metrics":
        return "Metrics";
      case "security":
        return "Security";
      case "database":
        return "Database";
      default:
        return "File";
    }
  };

  return (
    <div 
      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/80 transition-all duration-200 cursor-pointer group"
      onClick={() => {
        // Mock action - in real implementation this would open the source
        console.log(`Opening citation: ${citation.title} (${citation.url})`);
      }}
    >
      <div className={`flex-shrink-0 ${getTypeColor(citation.type)} group-hover:scale-110 transition-transform duration-200`}>
        {getIcon(citation.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {getTypeBadge(citation.type)}
          </Badge>
          {citation.timestamp && (
            <span className="text-xs text-muted-foreground">{citation.timestamp}</span>
          )}
        </div>
        <p className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {citation.title}
        </p>
      </div>
      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1" />
    </div>
  );
}

