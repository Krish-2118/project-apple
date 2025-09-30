"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WelcomeCard() {
  const { user } = useAuth();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Welcome back, {user?.name || "Farmer"}!
        </CardTitle>
        <CardDescription>
          Here's your farm's overview for today. Let's make it a productive one.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
