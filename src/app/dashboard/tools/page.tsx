"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { BrainCircuit, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCropRecommendation, CropRecommendationOutput } from "@/ai/flows/crop-recommendation";

const cropEmojis: { [key: string]: string } = {
  "rice": "🌾",
  "wheat": "🌾",
  "maize": "🌽",
  "jute": "🌿",
  "cotton": "⚪",
  "sugarcane": "🎋",
  "pulses": "🫘",
  "groundnut": "🥜",
  "default": "🌱",
};

// Focused on Odisha for better predictions
const indianStates = ["Odisha"];
const odishaSoilTypes = ["Alluvial", "Red", "Laterite", "Black", "Coastal Saline"];

const recommendationSchema = z.object({
  state: z.string().min(1, "Please select a state."),
  soilType: z.string().min(1, "Please select a soil type."),
  rainfall: z.coerce.number().min(0, "Rainfall must be a positive number."),
  temperature: z.coerce.number(),
  ph: z.coerce.number().min(0, "pH must be positive").max(14, "pH must be less than 14."),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

export default function ToolsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const recommendationForm = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: { state: 'Odisha', rainfall: 1500, temperature: 28, ph: 6.5 },
  });

  const handleGetRecommendations = async (values: RecommendationFormValues) => {
    setIsLoading(true);
    setRecommendations(null);
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
    const params = new URLSearchParams(recommendationForm.getValues() as any);
    params.set('crop', cropName);
    router.push(`/dashboard/tools/prediction?${params.toString()}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="h-7 w-7 text-primary"/>
                    <span>AI Farming Assistant</span>
                </CardTitle>
                <CardDescription>A guided tool to help you plan your farming cycle in Odisha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> 
                        Step 1: Find the Best Crop for Your Land
                    </h3>
                    <Form {...recommendationForm}>
                        <form onSubmit={recommendationForm.handleSubmit(handleGetRecommendations)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <FormField control={recommendationForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={recommendationForm.control} name="soilType" render={({ field }) => (<FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent>{odishaSoilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={recommendationForm.control} name="rainfall" render={({ field }) => ( <FormItem><FormLabel>Annual Rainfall (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={recommendationForm.control} name="temperature" render={({ field }) => ( <FormItem><FormLabel>Avg. Temp (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={recommendationForm.control} name="ph" render={({ field }) => ( <FormItem><FormLabel>Soil pH</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex justify-end md:col-span-2 lg:col-span-5">
                                <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Recommendations</Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {recommendations && (
                    <div className="p-6 border-2 border-primary/20 rounded-lg bg-background/50 animate-in fade-in-50 duration-500">
                        <h3 className="text-lg font-semibold mb-4">AI Recommendations:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map(rec => {
                                const emoji = cropEmojis[rec.cropName.toLowerCase()] || cropEmojis['default'];
                                return (
                                  <Card key={rec.cropName} className="overflow-hidden group cursor-pointer transition-all hover:border-primary hover:bg-primary/5 flex flex-col" onClick={() => handleSelectCrop(rec.cropName)}>
                                      <CardContent className="p-4 flex flex-col items-center justify-center text-center flex-grow">
                                        <div className="text-6xl mb-4">{emoji}</div>
                                        <p className="font-bold text-lg">{rec.cropName}</p>
                                        <p className="text-sm text-muted-foreground mt-1 flex-grow">{rec.reason}</p>
                                      </CardContent>
                                      <div className="flex items-center justify-center text-primary font-semibold text-sm p-3 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                          <span>Predict Yield</span>
                                          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                      </div>
                                  </Card>
                                )
                            })}
                        </div>
                         <div className="text-center mt-6">
                            <p className="text-muted-foreground text-sm">Or, select a different crop for analysis:</p>
                            <Button variant="link" onClick={() => handleSelectCrop("custom")}>Choose a different crop <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
