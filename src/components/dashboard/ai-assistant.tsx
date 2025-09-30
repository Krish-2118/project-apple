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
  Leaf,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getCropRecommendation, CropRecommendationOutput, CropRecommendationInput } from "@/ai/flows/crop-recommendation";
import { predictYield, PredictYieldOutput, PredictYieldInput } from "@/ai/flows/yield-prediction";
import { getMarketAnalysis, MarketAnalysisOutput } from "@/ai/flows/market-analysis";

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Forest", "Peaty", "Saline"];
const cropTypes = ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton"];

const predictionSchema = z.object({
  cropType: z.string().min(1, "Please select a crop type."),
  area: z.coerce.number().min(0.1, "Area must be greater than 0."),
  sowingDate: z.date({ required_error: "A sowing date is required." }),
  state: z.string().min(1, "Please select a state."),
  soilType: z.string().min(1, "Please select a soil type."),
});

type PredictionFormValues = z.infer<typeof predictionSchema>;

export function AiAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictYieldOutput | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);

  const { toast } = useToast();

  const predictionForm = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: { area: 1, sowingDate: new Date() },
  });

  const resetOutputs = () => {
    setPrediction(null);
    setAnalysis(null);
    setRecommendations(null);
  };

  const getSubsequentInsights = async (values: PredictionFormValues) => {
      try {
        const [marketRes, cropRes] = await Promise.all([
           getMarketAnalysis({ cropName: values.cropType }),
           getCropRecommendation({ soilType: values.soilType, state: values.state })
        ]);
        setAnalysis(marketRes);

        // Filter out the crop that was already predicted
        const alternativeCrops = cropRes.recommendations.filter(rec => rec.cropName.toLowerCase() !== values.cropType.toLowerCase());
        setRecommendations(alternativeCrops);

      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch additional insights." });
      }
  };

  const getPrediction = async (values: PredictionFormValues) => {
    setIsLoading(true);
    resetOutputs();
    try {
      const result = await predictYield({
        ...values,
        sowingDate: format(values.sowingDate, "yyyy-MM-dd"),
      });
      setPrediction(result);
      await getSubsequentInsights(values); // Fetch analysis and recommendations after prediction
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not get yield prediction." });
    }
    setIsLoading(false);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI Farming Tools</CardTitle>
        <CardDescription>Get predictions and insights to optimize your farming cycle.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prediction Form */}
        <div className="p-6 border rounded-lg bg-background/50">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Step 1: Predict Your Yield</h3>
            <p className="text-sm text-muted-foreground mb-4">Start by entering your crop details to get an AI-powered yield forecast.</p>
            <Form {...predictionForm}>
                <form id="pred-form" onSubmit={predictionForm.handleSubmit(getPrediction)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={predictionForm.control} name="cropType" render={({ field }) => (<FormItem><FormLabel>Crop Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{cropTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={predictionForm.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Area (in acres)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={predictionForm.control} name="soilType" render={({ field }) => (<FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent>{soilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={predictionForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><Select onValuechange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Sowing Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" form="pred-form" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict Yield & Get Insights</Button>
                    </div>
                </form>
            </Form>
        </div>

        {/* Results Section */}
        {isLoading && (
            <div className="text-center p-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Our AI is crunching the numbers... Please wait.</p>
            </div>
        )}

        {prediction && (
          <div className="mt-6 space-y-6">
              {/* Step 2: Prediction Result */}
              <div className="text-center p-6 border rounded-lg bg-background/50">
                  <h3 className="font-semibold flex items-center justify-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" /> AI Yield Prediction</h3>
                  <p className="text-muted-foreground">Predicted Yield for {predictionForm.getValues("cropType")}</p>
                  <p className="text-5xl font-bold text-primary">{prediction.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                  <p className="text-muted-foreground">tonnes/acre</p>
              </div>

              {/* Step 3: Subsequent Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis && (
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent" /> Market Analysis</CardTitle>
                              <CardDescription>Current market trends for {predictionForm.getValues("cropType")}.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-foreground/90">{analysis.analysis}</p>
                          </CardContent>
                      </Card>
                  )}

                  {recommendations && recommendations.length > 0 && (
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Alternative Crops</CardTitle>
                              <CardDescription>Other suitable crops for your soil and state.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                              {recommendations.map((rec, index) => (
                                <div key={index} className="flex gap-3 p-3 items-start bg-card/50 rounded-md border">
                                    <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-2 mt-1">
                                        <Leaf className="w-4 h-4"/>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{rec.cropName}</p>
                                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                                    </div>
                                </div>
                              ))}
                          </CardContent>
                      </Card>
                  )}
              </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
