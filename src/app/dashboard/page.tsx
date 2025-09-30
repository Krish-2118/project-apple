import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { YieldPredictionCard } from "@/components/dashboard/yield-prediction-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { CropCalendarCard } from "@/components/dashboard/crop-calendar-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <WelcomeCard />
      </div>
      <WeatherCard />
      <YieldPredictionCard />
      <AlertsCard />
      <CropCalendarCard />
      <InventoryCard />
    </div>
  );
}
