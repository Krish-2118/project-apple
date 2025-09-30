import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { FarmsCard } from "@/components/dashboard/farms-card";
import { NotificationsCard } from "@/components/dashboard/notifications-card";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <WelcomeCard />
      </div>
      
      <div className="lg:col-span-2 grid gap-6 content-start">
        <FarmsCard />
        <NotificationsCard />
      </div>

      <div className="lg:col-span-1 grid gap-6 content-start">
        <WeatherCard />
        <InventoryCard />
      </div>
    </div>
  );
}
