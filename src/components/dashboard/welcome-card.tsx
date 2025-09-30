"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock user data
const user = {
    name: "Demo User",
}

export function WelcomeCard() {  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Welcome back, {user?.name || "Farmer"}!
        </CardTitle>
        <CardDescription>
          Your farm is looking great. Here's what's happening today.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
