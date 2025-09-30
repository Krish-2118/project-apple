import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Cloudy, Thermometer } from "lucide-react";

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
      </CardContent>
    </Card>
  );
}
