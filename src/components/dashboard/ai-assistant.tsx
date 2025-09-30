"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Calendar as CalendarIcon,
  ChevronRight,
  Leaf,
  Lightbulb,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getCropRecommendation, CropRecommendationOutput } from "@/ai/flows/crop-recommendation";
import { predictYield, PredictYieldOutput } from "@/ai/flows/yield-prediction";
import { getMarketAnalysis, MarketAnalysisOutput } from "@/ai/flows/market-analysis";
import { getYieldEnhancementTips, YieldEnhancementOutput } from "@/ai/flows/yield-enhancement";

// Focused on Odisha for better predictions
const indianStates = ["Odisha"];
const odishaSoilTypes = ["Alluvial", "Red", "Laterite", "Black", "Coastal Saline"];
const cropTypes = ["Rice", "Maize", "Jute", "Groundnut", "Pulses", "Sugarcane"];

const recommendationSchema = z.object({
  state: z.string().min(1, "Please select a state."),
  soilType: z.string().min(1, "Please select a soil type."),
});

const predictionSchema = z.object({
  cropType: z.string().min(1, "Please select a crop type."),
  area: z.coerce.number().min(0.1, "Area must be greater than 0."),
  sowingDate: z.date({ required_error: "A sowing date is required." }),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;
type PredictionFormValues = z.infer<typeof predictionSchema>;

export function AiAssistant() {
  const [currentStep, setCurrentStep] = useState<"recommend" | "predict" | "results">("recommend");
  const [isLoading, setIsLoading] = useState(false);
  
  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);
  const [prediction, setPrediction] = useState<PredictYieldOutput | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);
  const [enhancementTips, setEnhancementTips] = useState<YieldEnhancementOutput['tips'] | null>(null);

  const [formInputs, setFormInputs] = useState({
    state: 'Odisha',
    soilType: '',
    cropType: '',
  });

  const { toast } = useToast();

  const recommendationForm = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: { state: 'Odisha' },
  });

  const predictionForm = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: { area: 1, sowingDate: new Date() },
  });

  const handleGetRecommendations = async (values: RecommendationFormValues) => {
    setIsLoading(true);
    setFormInputs(prev => ({...prev, ...values}));
    try {
      const result = await getCropRecommendation(values);
      setRecommendations(result.recommendations);
      setCurrentStep("predict");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch crop recommendations." });
    }
    setIsLoading(false);
  };
  
  const handleSelectRecommendedCrop = (cropName: string) => {
      predictionForm.setValue("cropType", cropName);
      setFormInputs(prev => ({...prev, cropType: cropName}));
  }

  const handleGetPrediction = async (values: PredictionFormValues) => {
    setIsLoading(true);
    setFormInputs(prev => ({...prev, cropType: values.cropType}));
    setPrediction(null);
    setAnalysis(null);
    setEnhancementTips(null);

    const yieldInput = {
      ...values,
      state: formInputs.state,
      soilType: formInputs.soilType,
      sowingDate: format(values.sowingDate, "yyyy-MM-dd"),
    };

    try {
      const [yieldResult, marketResult, tipsResult] = await Promise.all([
        predictYield(yieldInput),
        getMarketAnalysis({ cropName: values.cropType }),
        getYieldEnhancementTips({ 
            ...yieldInput, 
            predictedYield: 0 // Placeholder, will be updated post-prediction
        }) 
      ]);

      // A more realistic flow would re-trigger tips generation with the actual yield, but we'll batch for speed
      setPrediction(yieldResult);
      setAnalysis(marketResult);
      setEnhancementTips(tipsResult.tips);
      
      setCurrentStep("results");
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not fetch all insights. Please try again." });
    }
    setIsLoading(false);
  };
  
  const handleReset = () => {
    setCurrentStep("recommend");
    setRecommendations(null);
    setPrediction(null);
    setAnalysis(null);
    setEnhancementTips(null);
    recommendationForm.reset({ state: 'Odisha' });
    predictionForm.reset({ area: 1, sowingDate: new Date() });
  };


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-primary"/>
            <span>AI Farming Assistant</span>
        </CardTitle>
        <CardDescription>A guided tool to help you plan your farming cycle in Odisha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Step 1: Get Recommendations */}
        <div className={cn("p-6 border rounded-lg", currentStep !== "recommend" && "bg-muted/30 border-dashed")}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Step 1: Find the Best Crop</h3>
            <Form {...recommendationForm}>
                <form onSubmit={recommendationForm.handleSubmit(handleGetRecommendations)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField control={recommendationForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={recommendationForm.control} name="soilType" render={({ field }) => (<FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={currentStep !== 'recommend'}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent>{odishaSoilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading || currentStep !== 'recommend'}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Recommendations</Button>
                    </div>
                </form>
            </Form>
        </div>

        {/* Step 2: Predict Yield */}
        {currentStep !== 'recommend' && (
            <div className={cn("p-6 border rounded-lg", currentStep !== "predict" && "bg-muted/30 border-dashed")}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Step 2: Predict Your Yield</h3>
                
                {recommendations && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-md mb-2">Recommended Crops:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {recommendations.map(rec => (
                                <button key={rec.cropName} onClick={() => handleSelectRecommendedCrop(rec.cropName)} className={cn("p-3 border rounded-md text-left transition-all hover:border-primary hover:bg-primary/5", formInputs.cropType === rec.cropName && "bg-primary/10 border-primary")}>
                                    <p className="font-semibold">{rec.cropName}</p>
                                    <p className="text-xs text-muted-foreground">{rec.reason}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <Form {...predictionForm}>
                    <form onSubmit={predictionForm.handleSubmit(handleGetPrediction)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <FormField control={predictionForm.control} name="cropType" render={({ field }) => (<FormItem><FormLabel>Selected Crop</FormLabel><Select onValueChange={(value) => { field.onChange(value); setFormInputs(prev => ({...prev, cropType: value})); }} value={field.value} disabled={currentStep !== 'predict'}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{[...new Set([...cropTypes, ...recommendations?.map(r => r.cropName) ?? []])].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={predictionForm.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Area (in acres)</FormLabel><FormControl><Input type="number" step="0.1" {...field} disabled={currentStep !== 'predict'} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Sowing Date</FormLabel><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )} disabled={currentStep !== 'predict'}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("2020-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        <div className="md:col-span-3 flex justify-end gap-2">
                           <Button type="button" variant="ghost" onClick={handleReset} disabled={isLoading}>Start Over</Button>
                           <Button type="submit" disabled={isLoading || currentStep !== 'predict'}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict & Analyze</Button>
                        </div>
                    </form>
                </Form>
            </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 'results' && prediction && (
            <div className="p-6 border-2 border-primary/50 rounded-lg bg-background/50 space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">AI-Powered Insights for {formInputs.cropType}</h3>
                    <p className="text-5xl font-bold text-primary mt-2">{prediction.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                    <p className="text-muted-foreground">Predicted Yield (tonnes/acre)</p>
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
  );
}
