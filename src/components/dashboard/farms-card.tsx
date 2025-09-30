"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, MountainSnow } from "lucide-react";

type Farm = {
  id: number;
  name: string;
  location: string;
  area: number;
  unit: string;
};

const farms: Farm[] = [
  { id: 1, name: "Sunrise Meadows", location: "Punjab", area: 15, unit: "acres" },
  { id: 2, name: "Green Valley Fields", location: "Haryana", area: 25, unit: "acres" },
];

export function FarmsCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">My Farms</CardTitle>
                <CardDescription>Your registered farm plots</CardDescription>
            </div>
            <MountainSnow className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {farms.map((farm) => (
          <div key={farm.id} className="p-3 rounded-md border bg-background/50 flex justify-between items-center">
            <div>
              <p className="font-semibold">{farm.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {farm.location}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold">{farm.area} {farm.unit}</p>
                <Button variant="link" size="sm" className="h-auto p-0">Manage</Button>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">Add Farm</Button>
      </CardContent>
    </Card>
  );
}
