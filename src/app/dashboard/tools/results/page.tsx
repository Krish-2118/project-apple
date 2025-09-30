'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lightbulb,
  Loader2,
  MapPin,
  TrendingUp,
  Mountain,
  Cloudy,
  Thermometer,
  Droplets,
} from 'lucide-react';
import Image from 'next/image';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlaceHolderImage } from '@/lib/placeholder-images';
import type { MarketAnalysisOutput } from '@/ai/flows/market-analysis';
import type { PredictYieldOutput } from '@/ai/flows/yield-prediction';
import type { YieldEnhancementOutput } from '@/ai/flows/yield-enhancement';
import { Separator } from '@/components/ui/separator';

export interface ResultsData {
  yieldResult: PredictYieldOutput;
  marketResult: MarketAnalysisOutput;
  tipsResult: YieldEnhancementOutput;
  crop: string;
  params: {
    soilType: string;
    state: string;
    rainfall: string;
    temperature: string;
    ph: string;
  }
}

const cropEmojis: { [key: string]: string } = {
  rice: '🌾',
  wheat: '🍞',
  maize: '🌽',
  jute: '🌿',
  cotton: '⚪',
  sugarcane: '🎋',
  pulses: '🫘',
  groundnut: '🥜',
  custom: '🌱',
  default: '🌱',
};

function ResultsPageContent() {
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);

  useEffect(() => {
    const resultsJson = sessionStorage.getItem('analysisResults');
    if (resultsJson) {
      try {
        setResults(JSON.parse(resultsJson));
      } catch (error) {
        console.error("Failed to parse analysis results:", error);
        router.replace('/dashboard/tools');
      }
    } else {
      // If no results, wait a moment then check again, or redirect.
      setTimeout(() => {
        const freshResults = sessionStorage.getItem('analysisResults');
        if (freshResults) {
          setResults(JSON.parse(freshResults));
        } else {
          router.replace('/dashboard/tools');
        }
      }, 500);
    }
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard/tools');
  };

  if (!results) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 mt-4">Loading analysis results...</p>
      </div>
    );
  }

  const { yieldResult, marketResult, tipsResult, crop, params } = results;
  const cropEmoji =
    cropEmojis[crop.toLowerCase() as keyof typeof cropEmojis] ||
    cropEmojis['default'];
  const placeholderImage = getPlaceHolderImage(crop || 'default');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Assistant
      </Button>

      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <Image
            src={placeholderImage.imageUrl}
            alt={placeholderImage.description}
            data-ai-hint={placeholderImage.imageHint}
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="text-7xl mb-2">{cropEmoji}</div>
            <CardTitle className="font-headline text-3xl">
              Analysis Report for {crop}
            </CardTitle>
            <CardDescription>
              AI-powered insights based on your farm's parameters.
            </CardDescription>
          </div>
        </div>
        {params && (
         <div className="grid grid-cols-2 md:grid-cols-4 text-center text-sm p-4 bg-muted/50 border-t gap-y-4">
            <div className="flex flex-col items-center gap-1"><Mountain className="w-5 h-5 text-muted-foreground"/><div><span className="font-semibold">{params.soilType}</span><p className="text-xs text-muted-foreground">Soil</p></div></div>
            <div className="flex flex-col items-center gap-1"><Cloudy className="w-5 h-5 text-muted-foreground"/><div><span className="font-semibold">{params.rainfall}mm</span><p className="text-xs text-muted-foreground">Rainfall</p></div></div>
            <div className="flex flex-col items-center gap-1"><Thermometer className="w-5 h-5 text-muted-foreground"/><div><span className="font-semibold">{params.temperature}°C</span><p className="text-xs text-muted-foreground">Temp</p></div></div>
            <div className="flex flex-col items-center gap-1"><Droplets className="w-5 h-5 text-muted-foreground"/><div><span className="font-semibold">{params.ph}</span><p className="text-xs text-muted-foreground">pH</p></div></div>
        </div>
        )}
      </Card>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Yield Prediction</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-7xl font-bold text-primary">{yieldResult.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                    <p className="text-muted-foreground font-medium">Tonnes / Acre</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><TrendingUp className="h-6 w-6 text-accent" /> Market Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-foreground/90">{marketResult.analysis}</p>
                     <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Nearby Mandi Prices:</h4>
                        <div className="space-y-2 text-sm p-3 rounded-md bg-muted/50">
                        {marketResult.mandiPrices.map((mandi, index) => (
                            <div key={index} className="flex justify-between">
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><Lightbulb className="h-6 w-6 text-primary" /> Yield Enhancement Tips</CardTitle>
                    <CardDescription>Actionable advice to improve your crop outcome.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tipsResult.tips.map((tip, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 rounded-lg bg-primary/5 border border-primary/10">
                             <div className="flex h-6 w-6 rounded-full bg-primary text-primary-foreground items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                {index + 1}
                            </div>
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
        <Suspense fallback={
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Loading analysis results...</p>
            </div>
          }>
            <ResultsPageContent />
        </Suspense>
    )
}
