"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit } from "lucide-react";

export function PlanCycleCard() {
    return (
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6 text-primary"/>
                            <span>Plan Your Next Farming Cycle</span>
                        </CardTitle>
                        <CardDescription>Use our AI Assistant to get crop recommendations, yield predictions, and market analysis.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Link href="/dashboard/tools">
                    <Button>
                        <span>Start Planning</span>
                        <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
