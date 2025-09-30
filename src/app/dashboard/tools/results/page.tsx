'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, Lightbulb, Loader2, MapPin, TrendingUp, Wind } from 'lucide-react';
import type { PredictYieldOutput } from '@/ai/flows/yield-prediction';
import type { MarketAnalysisOutput } from '@/ai/flows/market-analysis';
import type { YieldEnhancementOutput } from '@/ai/flows/yield-enhancement';
import { getPlaceHolderImage } from "@/lib/placeholder-images";
import Image from "next/image";

type ResultsData = {
    yieldResult: PredictYieldOutput;
    marketResult: MarketAnalysisOutput;
    tipsResult: YieldEnhancementOutput;
    userInput: {
        cropType: string;
        state: string;
        soilType: string;
        area: number;
    }
}

const cropEmojis: { [key: string]: string } = {
  "rice": "🌾", "wheat": "🌾", "maize": "🌽", "jute": "🌿", "cotton": "⚪",
  "sugarcane": "🎋", "pulses": "🫘", "groundnut": "🥜", "custom": "🌱", "default": "🌱",
};

function ResultsPageContent() {
    const router = useRouter();
    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedResults = sessionStorage.getItem('analysisResults');
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        }
        setLoading(false);
    }, []);

    const handleBack = () => {
        router.push('/dashboard/tools');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    if (!results) {
        return (
            <div className="text-center">
                <p>No results found. Please start a new analysis.</p>
                <Button onClick={handleBack} className="mt-4">Go Back</Button>
            </div>
        )
    }

    const { yieldResult, marketResult, tipsResult, userInput } = results;
    const placeholderImage = getPlaceHolderImage(userInput.cropType);
    const cropEmoji = cropEmojis[userInput.cropType.toLowerCase() as keyof typeof cropEmojis] || cropEmojis['default'];
    
    return (
    <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Start New Analysis</Button>
        
        <Card className="overflow-hidden">
            <div className="relative h-48 w-full">
                 <Image 
                    src={placeholderImage.imageUrl}
                    alt={placeholderImage.description}
                    data-ai-hint={placeholderImage.imageHint}
                    fill
                    style={{objectFit: 'cover'}}
                    className="opacity-20"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                 <div className="absolute bottom-0 left-0 p-6">
                    <div className="text-7xl mb-2">{cropEmoji}</div>
                    <CardTitle className="font-headline text-3xl">
                        AI Analysis Report for {userInput.cropType}
                    </CardTitle>
                    <CardDescription>Generated based on your farm conditions in {userInput.state}</CardDescription>
                 </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
           <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Predicted Yield</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                         <p className="text-6xl font-bold text-primary">{yieldResult.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                         <p className="text-muted-foreground font-medium">Tonnes / Acre</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-headline"><TrendingUp className="h-6 w-6 text-accent" /> Market Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-foreground/90">{marketResult.analysis}</p>
                        <div>
                            <h4 className="font-semibold mb-2">Nearby Mandi Prices:</h4>
                            <div className="space-y-2 text-sm">
                            {marketResult.mandiPrices.map((mandi, index) => (
                                <div key={index} className="flex justify-between p-2 rounded-md bg-muted/50">
                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {mandi.mandiName}</span>
                                    <span className="font-mono font-semibold">{mandi.price}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
           </div>
           
            <div className="lg:col-span-2">
                <Card className="bg-background/80">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-headline"><Lightbulb className="h-6 w-6 text-primary" /> Yield Enhancement Tips</CardTitle>
                        <CardDescription>Actionable advice to improve your crop outcome.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {tipsResult.tips.map((tip, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <ChevronRight className="w-5 h-5 mt-1 text-primary flex-shrink-0"/>
                                <div>
                                    <p className="font-semibold text-base">{tip.title}</p>
                                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ResultsPageContent />
        </Suspense>
    )
}
