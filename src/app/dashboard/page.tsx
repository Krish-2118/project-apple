import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { YieldPredictionCard } from "@/components/dashboard/yield-prediction-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { CropCalendarCard } from "@/components/dashboard/crop-calendar-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-4">
            <WelcomeCard />
        </div>
        <div className="lg:col-span-2">
            <WeatherCard />
        </div>
        <div className="lg:col-span-2">
            <AlertsCard />
        </div>
        <div className="lg:col-span-4">
            <YieldPredictionCard />
        </div>
        <div className="lg:col-span-2">
            <CropCalendarCard />
        </div>
        <div className="lg:col-span-2">
            <InventoryCard />
        </div>
    </div>
  );
}
