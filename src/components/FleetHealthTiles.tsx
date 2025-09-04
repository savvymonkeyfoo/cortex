import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const healthMetrics = [
  {
    title: "API Gateway",
    status: "healthy",
    uptime: "99.98%",
    trend: "up",
    value: "156ms",
    label: "Avg Response"
  },
  {
    title: "Database Cluster",
    status: "warning",
    uptime: "99.85%",
    trend: "down",
    value: "847ms",
    label: "Query Time"
  },
  {
    title: "Message Queue",
    status: "healthy",
    uptime: "100%",
    trend: "stable",
    value: "12.3K",
    label: "Messages/min"
  },
  {
    title: "CDN",
    status: "healthy",
    uptime: "99.99%",
    trend: "up",
    value: "23ms",
    label: "Cache Hit"
  }
];

export function FleetHealthTiles() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {healthMetrics.map((metric) => (
        <Card key={metric.title} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium">{metric.title}</h4>
              <Badge 
                variant={metric.status === "healthy" ? "secondary" : "destructive"}
                className="text-xs"
              >
                {metric.status}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-semibold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
              
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                {metric.trend === "stable" && <Minus className="h-3 w-3 text-gray-500" />}
                <span className="text-muted-foreground">Uptime: {metric.uptime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}