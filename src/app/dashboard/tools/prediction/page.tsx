'use client';

import { Suspense } from "react";
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ArrowLeft, BrainCircuit, Calendar as CalendarIcon, ChevronRight, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { predictYield, PredictYieldOutput } from '@/ai/flows/yield-prediction';
import { getMarketAnalysis, MarketAnalysisOutput } from '@/ai/flows/market-analysis';
import { getYieldEnhancementTips, YieldEnhancementOutput } from '@/ai/flows/yield-enhancement';

const cropTypes = ["Rice", "Maize", "Jute", "Groundnut", "Pulses", "Sugarcane", "Wheat", "Cotton"];

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
  area: z.coerce.number().min(0.1, 'Area must be greater than 0.'),
  sowingDate: z.date({ required_error: 'A sowing date is required.' }),
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
  }), [searchParams]);

  const predictionForm = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      cropType: formInputs.crop === 'custom' ? '' : formInputs.crop,
      area: 1, // Default area to 1 acre, since we removed the input
      sowingDate: new Date(),
    },
  });

  const handleGetPrediction = async (values: PredictionFormValues) => {
    setIsLoading(true);
    setPrediction(null);
    setAnalysis(null);
    setEnhancementTips(null);

    const yieldInput = {
      ...values,
      state: formInputs.state,
      soilType: formInputs.soilType,
      sowingDate: format(values.sowingDate, 'yyyy-MM-dd'),
    };
    
    if (!yieldInput.soilType) {
        toast({ variant: "destructive", title: "Missing Information", description: "Soil type is required. Please go back and select it." });
        setIsLoading(false);
        return;
    }

    try {
      const yieldResult = await predictYield(yieldInput);
      setPrediction(yieldResult);

      // Fetch analysis and tips after getting the prediction
      const [marketResult, tipsResult] = await Promise.all([
        getMarketAnalysis({ cropName: values.cropType }),
        getYieldEnhancementTips({
          ...yieldInput,
          predictedYield: yieldResult.predictedYieldTonnesPerAcre,
        }),
      ]);

      setAnalysis(marketResult);
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

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleReset} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Recommendations</Button>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="h-7 w-7 text-primary"/>
                    <span>AI Farming Assistant</span>
                </CardTitle>
                <CardDescription>Step 2: Predict Yield & Get Actionable Insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="p-6 border rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                        <div className="text-6xl">{cropEmoji}</div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Prediction for {formInputs.crop === 'custom' ? 'Your Crop' : formInputs.crop}
                            </h3>
                            <p className="text-sm text-muted-foreground">Fill in the details below to predict the yield and get market analysis for your selected crop.</p>
                             <div className="text-xs text-muted-foreground mt-2 space-x-4">
                                <span>State: <strong>{formInputs.state}</strong></span>
                                {formInputs.soilType && <span>Soil: <strong>{formInputs.soilType}</strong></span>}
                            </div>
                        </div>
                    </div>
                     <Form {...predictionForm}>
                        <form onSubmit={predictionForm.handleSubmit(handleGetPrediction)} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <FormField control={predictionForm.control} name="cropType" render={({ field }) => (<FormItem><FormLabel>Selected Crop</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{[...new Set(cropTypes)].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Sowing Date</FormLabel><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("2020-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                            <div className="md:col-span-2 flex justify-end gap-2">
                               <Button type="submit" disabled={isLoading || !predictionForm.formState.isValid}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict & Analyze</Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {prediction && (
                    <div className="p-6 border-2 border-primary/50 rounded-lg bg-background/50 space-y-6 animate-in fade-in-50 duration-500">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">AI-Powered Insights for {selectedCrop}</h3>
                            <div className="flex justify-center items-baseline gap-8 mt-2">
                                <div>
                                    <p className="text-5xl font-bold text-primary">{prediction.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                                    <p className="text-muted-foreground">Tonnes / Acre</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {enhancementTips && enhancementTips.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Yield Enhancement Tips</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {enhancementTips.map((tip, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <ChevronRight className="w-4 h-4 mt-1 text-primary flex-shrink-0"/>
                                            <div>
                                                <p className="font-semibold">{tip.title}</p>
                                                <p className="text-sm text-muted-foreground">{tip.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            )}
                            {analysis && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent" /> Market Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/90">{analysis.analysis}</p>
                                </CardContent>
                            </Card>
                            )}
                        </div>
                        <div className="flex justify-center pt-4">
                            <Button onClick={handleReset}>Plan Another Cycle</Button>
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
        <Suspense fallback={<div>Loading...</div>}>
            <PredictionPageContent />
        </Suspense>
    )
}
