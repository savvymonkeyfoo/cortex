import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Clock, User, AlertCircle, CheckCircle, Megaphone } from "lucide-react";

const recentActivity = [
  {
    id: 1,
    type: "incident",
    title: "API Gateway incident resolved",
    user: "Sarah Chen",
    time: "5m ago",
    icon: CheckCircle,
    color: "text-green-500"
  },
  {
    id: 2,
    type: "deployment",
    title: "Database migration completed",
    user: "Mike Rodriguez",
    time: "12m ago",
    icon: CheckCircle,
    color: "text-blue-500"
  },
  {
    id: 3,
    type: "alert",
    title: "High memory usage detected",
    user: "System",
    time: "18m ago",
    icon: AlertCircle,
    color: "text-yellow-500"
  },
  {
    id: 4,
    type: "task",
    title: "Security patch applied",
    user: "Lisa Park",
    time: "32m ago",
    icon: CheckCircle,
    color: "text-green-500"
  },
  {
    id: 5,
    type: "incident",
    title: "CDN cache miss spike",
    user: "Auto-detected",
    time: "45m ago",
    icon: AlertCircle,
    color: "text-red-500"
  }
];

const announcements = [
  {
    id: 1,
    title: "Scheduled Maintenance Window",
    content: "Database cluster maintenance scheduled for this Saturday 2-4 AM UTC",
    time: "2h ago",
    priority: "high"
  },
  {
    id: 2,
    title: "Security Policy Update",
    content: "New multi-factor authentication requirements for production access",
    time: "1d ago",
    priority: "medium"
  },
  {
    id: 3,
    title: "Team Training Session",
    content: "Kubernetes troubleshooting workshop next Friday at 3 PM",
    time: "2d ago",
    priority: "low"
  }
];

export function RightRail() {
  return (
    <div className="w-80 border-l bg-background p-4 space-y-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{activity.user}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && <Separator className="mt-3" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div key={announcement.id}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium">{announcement.title}</h4>
                    <Badge 
                      variant={
                        announcement.priority === "high" ? "destructive" :
                        announcement.priority === "medium" ? "secondary" : "destructive"
                      }
                      className={`text-xs ${
                        announcement.priority === "medium" ? "bg-ai-secondary text-white glow-ai-primary" : ""
                      }`}
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {announcement.time}
                  </div>
                </div>
                {index < announcements.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}