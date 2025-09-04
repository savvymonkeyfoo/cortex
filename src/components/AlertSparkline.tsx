import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingDown } from "lucide-react";

export function AlertSparkline() {
  // Mock data for the last 24 hours (hourly data points)
  const alertData = [2, 1, 0, 1, 3, 2, 1, 0, 0, 2, 4, 6, 3, 2, 1, 0, 1, 2, 3, 1, 0, 0, 1, 2];
  const maxValue = Math.max(...alertData);
  const currentAlerts = alertData[alertData.length - 1];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Alert Rate (24h)
          <div className="flex items-center gap-1 text-green-600">
            <TrendingDown className="h-3 w-3" />
            <span className="text-xs">-23%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between h-16 gap-1">
          {alertData.map((value, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-t-sm flex-1 min-w-0"
              style={{
                height: `${(value / maxValue) * 100}%`,
                minHeight: value > 0 ? '2px' : '0px'
              }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-semibold">{currentAlerts}</span>
          <span className="text-xs text-muted-foreground">alerts/hour</span>
        </div>
      </CardContent>
    </Card>
  );
}