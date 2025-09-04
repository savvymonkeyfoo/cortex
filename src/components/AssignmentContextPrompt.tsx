import { Card } from "./ui/card";
import { Button } from "./ui/button";

export function AssignmentContextPrompt({
  onSelect
}: { onSelect: (mode: 'full'|'summary'|'none') => void }) {
  return (
    <Card className="rounded-2xl p-4 bg-background-elevated border-border shadow-sm">
      <div className="text-sm font-medium mb-3">
        What context from this chat should I include with this assignment?
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onSelect('full')}>Full transcript</Button>
        <Button variant="default" onClick={() => onSelect('summary')}>Summary</Button>
        <Button variant="outline" onClick={() => onSelect('none')}>No context</Button>
      </div>
    </Card>
  );
}