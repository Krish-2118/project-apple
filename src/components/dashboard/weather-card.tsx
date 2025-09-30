"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Cloudy, Thermometer, Loader2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateAgriculturalAlert } from "@/ai/flows/agricultural-alerts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const weatherData = {
  city: "Rourkela",
  today: {
    temp: 32,
    condition: "Sunny",
    icon: <Sun className="h-6 w-6 text-yellow-500" />,
    high: 34,
    low: 25,
  },
  forecast: [
    { day: "Mon", icon: <Cloudy className="h-6 w-6 text-gray-400" />, high: 33 },
    { day: "Tue", icon: <CloudRain className="h-6 w-6 text-blue-400" />, high: 30 },
    { day: "Wed", icon: <CloudRain className="h-6 w-6 text-blue-400" />, high: 29 },
    { day: "Thu", icon: <Cloud className="h-6 w-6 text-gray-500" />, high: 31 },
    { day: "Fri", icon: <Sun className="h-6 w-6 text-yellow-500" />, high: 34 },
  ],
};

export function WeatherCard() {
    const [alert, setAlert] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGetAlert = async () => {
        setIsLoading(true);
        setAlert(null);
        try {
            const forecastString = `Today: ${weatherData.today.condition}, ${weatherData.today.temp}°C. Next 5 days: ${weatherData.forecast.map(f => `${f.day} ${f.high}°`).join(', ')}`;
            const result = await generateAgriculturalAlert({ weatherForecast: forecastString });
            setAlert(result.alert);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not generate weather alert." });
            console.error(error);
        }
        setIsLoading(false);
    }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Weather</CardTitle>
                <CardDescription>{weatherData.city}</CardDescription>
            </div>
            <Thermometer className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                {weatherData.today.icon}
                <div className="text-5xl font-bold">{weatherData.today.temp}°C</div>
            </div>
            <div className="text-right">
                <div className="font-medium">{weatherData.today.condition}</div>
                <div className="text-sm text-muted-foreground">
                H: {weatherData.today.high}° L: {weatherData.today.low}°
                </div>
            </div>
            </div>
            <div className="mt-6 pt-6 border-t">
            <div className="flex justify-around text-center">
                {weatherData.forecast.map((day) => (
                <div key={day.day} className="flex flex-col items-center space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">{day.day}</div>
                    {day.icon}
                    <div className="text-sm font-semibold">{day.high}°</div>
                </div>
                ))}
            </div>
            </div>
        </div>

        <div className="mt-6">
            {alert && (
                <Alert className="mb-4 animate-in fade-in-50 duration-500">
                    <WandSparkles className="h-4 w-4" />
                    <AlertTitle>AI Advice</AlertTitle>
                    <AlertDescription>
                        {alert}
                    </AlertDescription>
                </Alert>
            )}
            <Button className="w-full" onClick={handleGetAlert} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                Get AI Farming Advice
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
