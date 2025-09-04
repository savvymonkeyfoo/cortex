import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DialProps {
  title: string;
  current: number;
  target: number;
  unit: string;
}

function ProgressDial({ title, current, target, unit }: DialProps) {
  const percentage = (current / target) * 100;
  const isHealthy = percentage >= 95;
  
  return (
    <Card className="text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative w-20 h-20 mx-auto">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted stroke-current opacity-20"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${percentage}, 100`}
              className={`${isHealthy ? 'text-green-500' : 'text-yellow-500'} stroke-current`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold">{current.toFixed(1)}{unit}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Target: {target}{unit}
        </div>
      </CardContent>
    </Card>
  );
}

export function SLADials() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <ProgressDial title="API Uptime" current={99.98} target={99.9} unit="%" />
      <ProgressDial title="Response Time" current={156} target={200} unit="ms" />
      <ProgressDial title="Error Rate" current={0.02} target={0.1} unit="%" />
    </div>
  );
}