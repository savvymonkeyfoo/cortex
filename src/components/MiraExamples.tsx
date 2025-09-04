// MiraExamples.tsx - Example implementations using the Mira design system
import * as React from "react";
import { MiraCard, MiraBadge, MiraProgress, MiraStepRow, TriageCardContent, AssignmentCardContent } from "./MiraCard";
import { AccentCard } from "./AccentCard";
import { createMiraStyle, mapPriorityToMira, mapRiskToMira } from "../lib/mira-design-system";

// Example: Converting existing Triage item to Mira system
export function MiraTriageExample() {
  const triageItem = {
    id: "1",
    title: "Critical security patch deployment",
    risk: "Critical" as const,
    summary: "Deploy critical CVE-2024-1234 patch to all production servers",
    agent: "SecurityBot-v1.3",
    autonomyLevel: "Low",
    confidence: 78,
    assignee: "Lisa Park",
    provenance: ["CVE Database", "Security Scanner", "Vendor Advisory"]
  };
  
  const { accentFrom, level } = mapRiskToMira(triageItem.risk);
  
  return (
    <MiraCard accentFrom={accentFrom} level={level} className="max-w-2xl">
      <TriageCardContent
        title={triageItem.title}
        risk={level}
        summary={triageItem.summary}
        agent={triageItem.agent}
        autonomy={triageItem.autonomyLevel}
        confidence={triageItem.confidence}
        assignee={triageItem.assignee}
        provenance={triageItem.provenance}
      />
    </MiraCard>
  );
}

// Example: Converting existing Assignment to Mira system
export function MiraAssignmentExample() {
  const assignment = {
    id: "2",
    title: "Deploy microservice updates",
    description: "Update payment processing microservices to version 2.1.0",
    priority: "high" as const,
    createdBy: "Sarah Chen",
    progress: 65
  };
  
  const { accentFrom, level } = mapPriorityToMira(assignment.priority);
  
  return (
    <MiraCard accentFrom={accentFrom} level={level} className="max-w-2xl">
      <AssignmentCardContent
        title={assignment.title}
        description={assignment.description}
        priority={level}
        createdBy={assignment.createdBy}
        progress={assignment.progress}
        statusNote="Executing step 3/5: Database migration in progress..."
      />
    </MiraCard>
  );
}

// Example: Using AccentCard with Mira system
export function MiraAccentCardExample() {
  return (
    <AccentCard 
      tone="mira" 
      statusKey="high"
      useMiraSystem={true}
      className="p-4 max-w-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="mira-card-title">Network Alert</h3>
        <MiraBadge type="priority" level="high">High</MiraBadge>
      </div>
      <p className="mira-card-description mt-2">
        Database response time exceeded threshold
      </p>
      <div className="mt-3">
        <MiraProgress value={85} />
        <div className="text-xs text-muted-foreground mt-1">
          Resolution in progress
        </div>
      </div>
    </AccentCard>
  );
}

// Example: Step row with Mira styling
export function MiraStepExample() {
  const steps = [
    { id: 1, title: "Backup database", description: "Create snapshot", state: "done" as const },
    { id: 2, title: "Deploy application", description: "Rolling deployment", state: "running" as const },
    { id: 3, title: "Run tests", description: "Integration tests", state: "pending" as const },
  ];
  
  return (
    <div className="space-y-2 max-w-2xl">
      {steps.map((step, index) => (
        <MiraStepRow
          key={step.id}
          index={index + 1}
          title={step.title}
          description={step.description}
          state={step.state}
          agent={<MiraBadge type="priority" level="medium">DevOps</MiraBadge>}
        />
      ))}
    </div>
  );
}

// Example: Progress states
export function MiraProgressExample() {
  return (
    <div className="space-y-4 max-w-md">
      <div>
        <div className="text-sm font-medium mb-2">Idle (0%)</div>
        <MiraProgress value={0} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">In Progress (45%)</div>
        <MiraProgress value={45} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Complete (100%)</div>
        <MiraProgress value={100} />
      </div>
    </div>
  );
}

// Example: Badge variations
export function MiraBadgeExample() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium mb-2">Priority Badges</div>
        <div className="flex gap-2">
          <MiraBadge type="priority" level="low">Low</MiraBadge>
          <MiraBadge type="priority" level="medium">Medium</MiraBadge>
          <MiraBadge type="priority" level="high">High</MiraBadge>
          <MiraBadge type="priority" level="critical">Critical</MiraBadge>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Risk Badges</div>
        <div className="flex gap-2">
          <MiraBadge type="risk" level="low">Low Risk</MiraBadge>
          <MiraBadge type="risk" level="medium">Medium Risk</MiraBadge>
          <MiraBadge type="risk" level="high">High Risk</MiraBadge>
          <MiraBadge type="risk" level="critical">Critical Risk</MiraBadge>
        </div>
      </div>
    </div>
  );
}