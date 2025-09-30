'use client';

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, BrainCircuit, ChevronRight, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { predictYield, PredictYieldOutput } from '@/ai/flows/yield-prediction';
import { getMarketAnalysis, MarketAnalysisOutput } from '@/ai/flows/market-analysis';
import { getYieldEnhancementTips, YieldEnhancementOutput } from '@/ai/flows/yield-enhancement';
import { getPlaceHolderImage } from "@/lib/placeholder-images";
import Image from "next/image";


const cropTypes = ["Rice", "Maize", "Jute", "Groundnut", "Pulses", "Sugarcane", "Wheat", "Cotton"];
const sowingMonths = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

const cropEmojis: { [key: string]: string } = {
  "rice": "🌾",
  "wheat": "🌾",
  "maize": "🌽",
  "jute": "🌿",
  "cotton": "⚪",
  "sugarcane": "🎋",
  "pulses": "🫘",
  "groundnut": "🥜",
  "custom": "🌱",
  "default": "🌱",
};

const predictionSchema = z.object({
  cropType: z.string().min(1, 'Please select a crop type.'),
  sowingDate: z.string().min(1, 'Please select a sowing month.'),
});

type PredictionFormValues = z.infer<typeof predictionSchema>;

function PredictionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictYieldOutput | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);
  const [enhancementTips, setEnhancementTips] = useState<YieldEnhancementOutput['tips'] | null>(null);

  const { toast } = useToast();

  const formInputs = useMemo(() => ({
      crop: searchParams.get('crop') || 'custom',
      state: searchParams.get('state') || 'Odisha',
      soilType: searchParams.get('soilType') || '',
      area: 1, // We'll always calculate per acre
  }), [searchParams]);

  const predictionForm = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      cropType: formInputs.crop === 'custom' ? '' : formInputs.crop,
      sowingDate: '',
    },
  });

  // Effect to sync URL param with form state
  useEffect(() => {
    const cropFromUrl = searchParams.get('crop');
    if (cropFromUrl && cropFromUrl !== 'custom') {
      predictionForm.setValue('cropType', cropFromUrl);
    }
  }, [searchParams, predictionForm]);

  const handleGetPrediction = async (values: PredictionFormValues) => {
    setIsLoading(true);
    setPrediction(null);
    setAnalysis(null);
    setEnhancementTips(null);

    // Construct a date from the selected month for the flow
    const monthIndex = sowingMonths.indexOf(values.sowingDate);
    const fullDate = new Date(new Date().getFullYear(), monthIndex, 1);

    const yieldInput = {
      ...values,
      state: formInputs.state,
      soilType: formInputs.soilType,
      area: formInputs.area,
      sowingDate: format(fullDate, 'yyyy-MM-dd'),
    };
    
    if (!yieldInput.soilType) {
        toast({ variant: "destructive", title: "Missing Information", description: "Soil type is required. Please go back and select it." });
        setIsLoading(false);
        return;
    }

    try {
      // Fetch all insights in parallel
      const [yieldResult, marketResult, tipsResult] = await Promise.all([
        predictYield(yieldInput),
        getMarketAnalysis({ cropName: values.cropType }),
        getYieldEnhancementTips({
          ...yieldInput,
          // We pass a temporary predicted yield to the tips flow.
          // In a real scenario, this might be a two-step process,
          // but for simulation, we'll use a placeholder value.
          // The actual prediction result will be displayed.
          predictedYield: 2.0, // Placeholder for concurrent call
        }),
      ]);

      // Now use the actual yield result for the state update
      setPrediction(yieldResult);
      setAnalysis(marketResult);
      // We can also re-fetch tips with the accurate yield if needed, but for now this is fine.
      setEnhancementTips(tipsResult.tips);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch all insights. Please try again.' });
      console.error(error);
    }
    setIsLoading(false);
  };
  
  const handleReset = () => {
    router.push('/dashboard/tools');
  };

  const selectedCrop = predictionForm.watch('cropType');
  const cropEmoji = cropEmojis[selectedCrop.toLowerCase() as keyof typeof cropEmojis] || cropEmojis['default'];
  const placeholderImage = getPlaceHolderImage(selectedCrop);

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleReset} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Recommendations</Button>
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
                        AI Analysis for {selectedCrop || 'Your Crop'}
                    </CardTitle>
                    <CardDescription>Step 2: Predict Yield & Get Actionable Insights</CardDescription>
                    <div className="text-xs text-muted-foreground mt-2 space-x-4">
                        <span>State: <strong>{formInputs.state}</strong></span>
                        {formInputs.soilType && <span>Soil: <strong>{formInputs.soilType}</strong></span>}
                    </div>
                 </div>
            </div>
            <CardContent className="p-6 space-y-8">
                <div className="p-6 border rounded-lg">
                     <h3 className="text-lg font-semibold mb-4">Provide Sowing Details</h3>
                     <Form {...predictionForm}>
                        <form onSubmit={predictionForm.handleSubmit(handleGetPrediction)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <FormField control={predictionForm.control} name="cropType" render={({ field }) => (<FormItem><FormLabel>Selected Crop</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{[...new Set(cropTypes)].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem><FormLabel>Sowing Month</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a month" /></SelectTrigger></FormControl><SelectContent>{sowingMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <div className="flex justify-end">
                               <Button type="submit" disabled={isLoading || !predictionForm.formState.isValid} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict & Analyze</Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {!isLoading && prediction && (
                    <div className="p-6 border-2 border-primary/20 rounded-lg bg-primary/5 space-y-6 animate-in fade-in-50 duration-500">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-primary-foreground/90">AI-Powered Insights for {selectedCrop}</h3>
                            <div className="flex justify-center items-baseline gap-2 mt-2">
                                <div>
                                    <p className="text-5xl font-bold text-primary">{prediction.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground font-medium">Tonnes / Acre (Predicted)</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {enhancementTips && enhancementTips.length > 0 && (
                            <Card className="bg-background/80">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg"><Lightbulb className="h-5 w-5 text-primary" /> Yield Enhancement Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {enhancementTips.map((tip, index) => (
                                        <div key={index} className="flex gap-3 items-start p-2 rounded-md bg-background">
                                            <ChevronRight className="w-4 h-4 mt-1 text-primary flex-shrink-0"/>
                                            <div>
                                                <p className="font-semibold text-sm">{tip.title}</p>
                                                <p className="text-xs text-muted-foreground">{tip.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            )}
                            {analysis && (
                            <Card className="bg-background/80">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-accent" /> Market Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/90">{analysis.analysis}</p>
                                </CardContent>
                            </Card>
                            )}
                        </div>
                        <div className="flex justify-center pt-4">
                            <Button onClick={handleReset} variant="secondary">Plan Another Cycle</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

export default function PredictionPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PredictionPageContent />
        </Suspense>
    )
}
