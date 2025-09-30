"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Info, AlertTriangle, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Notification = {
  id: number;
  message: string;
  farm: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
};

const notifications: Notification[] = [
  { id: 1, message: "Urea inventory is low.", farm: "Sunrise Meadows", severity: "warning", timestamp: "2h ago" },
  { id: 2, message: "High chance of pest infestation reported in your area.", farm: "Green Valley Fields", severity: "critical", timestamp: "1d ago" },
  { id:3, message: "New market analysis for Wheat is available.", farm: "General", severity: "info", timestamp: "3d ago"},
];

const severityConfig = {
    info: {
        icon: Info,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    warning: {
        icon: AlertTriangle,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
    },
    critical: {
        icon: CircleAlert,
        color: "text-red-500",
        bg: "bg-red-500/10"
    }
}

export function NotificationsCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Notifications</CardTitle>
                <CardDescription>Alerts and updates for your farms</CardDescription>
            </div>
            <Bell className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((note) => {
            const config = severityConfig[note.severity];
            const Icon = config.icon;
            return (
              <div key={note.id} className={cn("p-3 rounded-md flex items-start gap-3", config.bg)}>
                <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.color)} />
                <div className="flex-grow">
                    <p className="text-sm font-medium">{note.message}</p>
                    <p className="text-xs text-muted-foreground">{note.farm} &bull; {note.timestamp}</p>
                </div>
              </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
