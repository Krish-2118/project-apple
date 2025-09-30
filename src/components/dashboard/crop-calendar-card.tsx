"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const riceTasks = [
  { days: 0, task: "Sowing & Transplanting" },
  { days: 15, task: "Weed Management" },
  { days: 25, task: "First Fertilizer Application (Nitrogen)" },
  { days: 45, task: "Pest & Disease Monitoring" },
  { days: 55, task: "Second Fertilizer Application" },
  { days: 80, task: "Flowering Stage Water Management" },
  { days: 110, task: "Pre-Harvest Water Drainage" },
  { days: 120, task: "Harvesting" },
];

export function CropCalendarCard() {
  const [sowingDate, setSowingDate] = useState<Date | undefined>(new Date());
  const [crop, setCrop] = useState<string>("rice");

  const tasks = crop === 'rice' ? riceTasks : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Crop Calendar</CardTitle>
                <CardDescription>Your automated task manager</CardDescription>
            </div>
            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select defaultValue="rice" onValueChange={setCrop}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rice">Rice</SelectItem>
              <SelectItem value="wheat" disabled>Wheat (coming soon)</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !sowingDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {sowingDate ? `Sown on ${format(sowingDate, "PPP")}` : <span>Pick a sowing date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={sowingDate}
                onSelect={setSowingDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-4 h-48 overflow-y-auto pr-2">
          {sowingDate && tasks.map((task, index) => {
            const taskDate = addDays(sowingDate, task.days);
            const isPast = taskDate < new Date();
            return(
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", isPast ? "bg-primary" : "bg-muted")}>
                   {isPast && <CheckCircle2 className="w-5 h-5 text-primary-foreground p-0.5" />}
                </div>
                {index < tasks.length -1 && <Separator orientation="vertical" className="h-10 my-1" />}
              </div>
              <div>
                <p className={cn("font-semibold", isPast && "text-muted-foreground line-through")}>{task.task}</p>
                <p className="text-sm text-muted-foreground">{format(taskDate, "do MMMM, yyyy")}</p>
              </div>
            </div>
          )})}
        </div>

      </CardContent>
    </Card>
  );
}
