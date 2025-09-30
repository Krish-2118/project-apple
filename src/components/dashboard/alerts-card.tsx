"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import { generateAgriculturalAlert } from "@/ai/flows/agricultural-alerts";

// Using hardcoded weather forecast as per requirements
const weatherForecast = "Heavy rain expected in Rourkela for the next 2 days, followed by partly cloudy skies. Temperatures will be between 29-33°C.";

export function AlertsCard() {
  const [alert, setAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAlert() {
      try {
        setLoading(true);
        const result = await generateAgriculturalAlert({ weatherForecast });
        setAlert(result.alert);
      } catch (error) {
        console.error("Error generating alert:", error);
        setAlert("Could not fetch AI-powered advice at the moment.");
      } finally {
        setLoading(false);
      }
    }
    getAlert();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">AI-Powered Alerts</CardTitle>
                <CardDescription>Actionable advice for you</CardDescription>
            </div>
            <AlertTriangle className="h-6 w-6 text-accent" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating today's advice...</span>
          </div>
        ) : (
          <p className="font-medium text-foreground/90">
            {alert}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
