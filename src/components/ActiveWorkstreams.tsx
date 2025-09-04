import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Clock, User } from "lucide-react";

const workstreams = [
  {
    id: 1,
    title: "Database Migration - Phase 2",
    owner: "Sarah Chen",
    autonomy: "High",
    confidence: 85,
    eta: "16 minutes",
    status: "In Progress",
    description: "Migrating user data tables to new cluster"
  },
  {
    id: 2,
    title: "API Rate Limiting Implementation",
    owner: "Mike Rodriguez",
    autonomy: "Medium",
    confidence: 65,
    eta: "73 minutes",
    status: "Planning",
    description: "Implementing rate limiting across all API endpoints"
  },
  {
    id: 3,
    title: "Security Audit Remediation",
    owner: "Lisa Park",
    autonomy: "Low",
    confidence: 40,
    eta: "on hold",
    status: "Blocked",
    description: "Addressing critical security vulnerabilities"
  }
];

export function ActiveWorkstreams() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-medium">Active Workstreams</h3>
        <div className="h-2 w-2 bg-ai-primary rounded-full ai-pulse glow-ai-primary"></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {workstreams.map((workstream) => (
          <Card key={workstream.id} className="cursor-pointer large-card-hover border-l-4 border-l-ai-secondary"
                style={{ '--hover-border-color': 'var(--ai-secondary)' } as React.CSSProperties}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm leading-tight">{workstream.title}</CardTitle>
                <Badge 
                  variant={
                    workstream.status === "Blocked" ? "destructive" :
                    workstream.status === "Planning" ? "destructive" : "secondary"
                  }
                  className="text-xs ml-2"
                >
                  {workstream.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">{workstream.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3" />
                  <span>{workstream.owner}</span>
                  <Badge variant="outline" className="text-xs border-ai-secondary text-ai-secondary">
                    {workstream.autonomy} Autonomy
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span>{workstream.confidence}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={workstream.confidence} className="h-2 bg-gray-200" />
                    <div 
                      className="absolute top-0 left-0 h-2 bg-gradient-ai-primary rounded-full transition-all duration-500"
                      style={{ width: `${workstream.confidence}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>ETA: {workstream.eta}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}