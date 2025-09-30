"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Loader2, Sparkles, ArrowRight, Leaf, Sun, Droplets, Thermometer, Cloudy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCropRecommendation, CropRecommendationOutput } from "@/ai/flows/crop-recommendation";
import { getPlaceHolderImage } from '@/lib/placeholder-images';
import type { ResultsData } from "./results/page";
import { predictYield } from "@/ai/flows/yield-prediction";
import { getMarketAnalysis } from "@/ai/flows/market-analysis";
import { getYieldEnhancementTips } from "@/ai/flows/yield-enhancement";

const cropEmojis: { [key: string]: string } = {
  "rice": "🌾",
  "wheat": "🍞",
  "maize": "🌽",
  "jute": "🌿",
  "cotton": "⚪",
  "sugarcane": "🎋",
  "pulses": "🫘",
  "groundnut": "🥜",
  "default": "🌱",
};

const indianStates = ["Odisha", "Punjab", "Haryana", "Uttar Pradesh"];
const soilTypesByState: { [key: string]: string[] } = {
    "Odisha": ["Alluvial", "Red", "Laterite", "Black", "Coastal Saline"],
    "Punjab": ["Alluvial", "Sandy", "Loamy"],
    "Haryana": ["Alluvial", "Sandy", "Clay"],
    "Uttar Pradesh": ["Alluvial", "Black", "Red", "Loamy"],
};

const sowingMonths = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formSchema = z.object({
  state: z.string().min(1, "Please select a state."),
  soilType: z.string().min(1, "Please select a soil type."),
  rainfall: z.coerce.number().min(0, "Rainfall must be a positive number."),
  temperature: z.coerce.number(),
  ph: z.coerce.number().min(0, "pH must be positive").max(14, "pH must be less than 14."),
  cropType: z.string().optional(),
  sowingDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ToolsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { state: 'Odisha', soilType: 'Alluvial', rainfall: 1500, temperature: 28, ph: 6.5 },
  });

  const watchState = form.watch('state');
  const availableSoils = soilTypesByState[watchState] || [];

  const handleGetRecommendations = async (values: FormValues) => {
    setIsLoading(true);
    setRecommendations(null);
    setSelectedCrop(null);
    try {
      const result = await getCropRecommendation(values);
      setRecommendations(result.recommendations);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch crop recommendations." });
      console.error(error);
    }
    setIsLoading(false);
  };
  
  const handleSelectCrop = (cropName: string) => {
    setSelectedCrop(cropName);
    form.setValue('cropType', cropName);
  }

  const handleFinalSubmit = async (values: FormValues) => {
    if (!values.cropType || !values.sowingDate) {
      toast({ variant: 'destructive', title: 'Missing Details', description: 'Please select a crop and a sowing month.' });
      return;
    }
    setIsAnalyzing(true);
    
    const monthIndex = sowingMonths.indexOf(values.sowingDate);
    const fullDate = new Date(new Date().getFullYear(), monthIndex, 15);

    const predictionBaseInput = {
      cropType: values.cropType,
      state: values.state,
      soilType: values.soilType,
      sowingDate: format(fullDate, 'yyyy-MM-dd'),
    };
    
    try {
      // Run yield prediction first
      const yieldResult = await predictYield(predictionBaseInput);

      // Then run the other two in parallel, using the yield result
      const [marketResult, tipsResult] = await Promise.all([
        getMarketAnalysis({ cropName: values.cropType, state: values.state }),
        getYieldEnhancementTips({ 
          ...predictionBaseInput,
          predictedYield: yieldResult.predictedYieldTonnesPerAcre 
        }),
      ]);
      
      const results: ResultsData = {
          yieldResult,
          marketResult,
          tipsResult,
          crop: values.cropType,
          params: {
            soilType: values.soilType,
            state: values.state,
            rainfall: String(values.rainfall),
            temperature: String(values.temperature),
            ph: String(values.ph),
          }
      };

      sessionStorage.setItem('analysisResults', JSON.stringify(results));
      router.push('/dashboard/tools/results');

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch all insights. Please try again." });
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const placeholderImage = getPlaceHolderImage(selectedCrop || 'default');
  const cropEmoji = selectedCrop ? (cropEmojis[selectedCrop.toLowerCase()] || cropEmojis['default']) : '🌱';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card>
          <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BrainCircuit className="h-7 w-7 text-primary"/>
                  <span>AI Farming Assistant</span>
              </CardTitle>
              <CardDescription>A guided tool to help you plan your farming cycle.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
                <div className="p-6 border rounded-lg space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> 
                        Step 1: Find the Best Crop for Your Land
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="soilType" render={({ field }) => (<FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} value={field.value} key={watchState}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent>{availableSoils.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="rainfall" render={({ field }) => ( <FormItem><FormLabel>Annual Rainfall (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="temperature" render={({ field }) => ( <FormItem><FormLabel>Avg. Temp (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="ph" render={({ field }) => ( <FormItem><FormLabel>Soil pH</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" onClick={form.handleSubmit(handleGetRecommendations)} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Recommendations</Button>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {recommendations && (
                    <div className="p-6 border-2 border-primary/20 rounded-lg bg-primary/5 animate-in fade-in-50 duration-500">
                        <h3 className="text-lg font-semibold mb-4">Step 2: Select a Crop to Analyze</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map(rec => {
                                const emoji = cropEmojis[rec.cropName.toLowerCase()] || cropEmojis['default'];
                                return (
                                  <Card key={rec.cropName} className="overflow-hidden group cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 flex flex-col" onClick={() => handleSelectCrop(rec.cropName)}>
                                      <CardContent className="p-4 flex flex-col items-center justify-center text-center flex-grow">
                                        <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">{emoji}</div>
                                        <p className="font-bold text-lg">{rec.cropName}</p>
                                        <p className="text-sm text-muted-foreground mt-1 flex-grow">{rec.reason}</p>
                                      </CardContent>
                                      <div className="flex items-center justify-center text-primary font-semibold text-sm p-3 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                          <span>Select Crop</span>
                                          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                      </div>
                                  </Card>
                                )
                            })}
                        </div>
                    </div>
                )}

                {selectedCrop && (
                  <div className="p-6 border-2 border-accent/30 rounded-lg bg-accent/5 animate-in fade-in-50 duration-500 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-4xl">{cropEmoji}</span>
                      <span>Step 3: Provide Sowing Details for {selectedCrop}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <FormField control={form.control} name="sowingDate" render={({ field }) => (
                          <FormItem className="md:col-span-1">
                            <FormLabel>Sowing Month</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a month" /></SelectTrigger></FormControl>
                              <SelectContent>{sowingMonths.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" disabled={isAnalyzing || !form.watch('sowingDate')} className="w-full md:w-auto">
                          {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                          Predict & Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
      </Card>
    </div>
  );
}
