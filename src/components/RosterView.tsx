import { Crown, Wrench, Monitor, Shield, Network, Zap, Database, Activity, AlertTriangle } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const agents = [
  {
    id: "supervisor",
    name: "Supervisor",
    icon: Crown,
    description: "The Supervisor agent oversees all network operations and coordinates responses across multiple systems. It provides strategic oversight and ensures optimal resource allocation during critical incidents.",
    mcpTools: [
      { name: "System Orchestration", icon: Shield },
      { name: "Resource Management", icon: Database },
      { name: "Incident Coordination", icon: AlertTriangle },
      { name: "Performance Analytics", icon: Activity }
    ],
    performance: {
      accuracy: 97,
      completedTasks: 3847,
      lastUpdated: "August 25, 2025"
    },
    borderColor: "var(--ai-energy)",
    hoverColor: "var(--ai-energy)"
  },
  {
    id: "network-troubleshooting",
    name: "Network Troubleshooting",
    icon: Wrench,
    description: "The Network Troubleshooting agent specializes in diagnosing and resolving complex network issues. It performs deep analysis of network topology and provides automated remediation for common connectivity problems.",
    mcpTools: [
      { name: "Network Diagnostics", icon: Network },
      { name: "Topology Analysis", icon: Activity },
      { name: "Auto-Remediation", icon: Zap },
      { name: "Performance Monitoring", icon: Monitor }
    ],
    performance: {
      accuracy: 94,
      completedTasks: 3621,
      lastUpdated: "August 25, 2025"
    },
    borderColor: "var(--ai-secondary)",
    hoverColor: "var(--ai-secondary)"
  },
  {
    id: "network-monitoring",
    name: "Network Monitoring",
    icon: Monitor,
    description: "The Network Monitoring agent continuously tracks network health and performance metrics. It provides real-time insights and proactive alerts to prevent issues before they impact operations.",
    mcpTools: [
      { name: "Real-time Monitoring", icon: Activity },
      { name: "Predictive Analysis", icon: Database },
      { name: "Alert Management", icon: AlertTriangle },
      { name: "Metric Collection", icon: Network }
    ],
    performance: {
      accuracy: 96,
      completedTasks: 4012,
      lastUpdated: "August 25, 2025"
    },
    borderColor: "var(--ai-primary)",
    hoverColor: "var(--ai-primary)"
  }
];

export function RosterView() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl mb-2 text-foreground">Agent Roster</h1>
        <p className="text-foreground-muted">
          These are the agents you can command in your workspace
        </p>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          
          return (
            <Card
              key={agent.id}
              className="bg-card border border-border shadow-card dynamic-card-hover p-6 flex flex-col"
              style={{ 
                '--hover-border-color': agent.hoverColor,
                cursor: 'pointer'
              } as React.CSSProperties}
            >
              {/* Agent Avatar & Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: agent.borderColor }}
                >
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg text-foreground mb-3">{agent.name}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* MCP Tools Section */}
              <div className="mb-6">
                <h4 className="text-sm text-foreground mb-3">MCP</h4>
                <div className="grid grid-cols-2 gap-2">
                  {agent.mcpTools.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border-subtle"
                      >
                        <ToolIcon className="h-3 w-3 text-foreground-muted flex-shrink-0" />
                        <span className="text-xs text-foreground-muted truncate">
                          {tool.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Report */}
              <div className="mt-auto">
                <h4 className="text-sm text-foreground mb-3">Latest Performance Report</h4>
                <div className="space-y-3">
                  {/* Accuracy */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground-muted">Accuracy</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${agent.performance.accuracy}%`,
                            backgroundColor: agent.borderColor
                          }}
                        />
                      </div>
                      <span className="text-xs text-foreground min-w-[2.5rem] text-right">
                        {agent.performance.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Completed Tasks */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground-muted">Completed Tasks</span>
                    <span className="text-xs text-foreground">
                      {agent.performance.completedTasks.toLocaleString()}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground-muted">Last Updated</span>
                    <span className="text-xs text-foreground">
                      {agent.performance.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}