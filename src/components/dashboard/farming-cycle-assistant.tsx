"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle,
  BrainCircuit,
  Calendar as CalendarIcon,
  Leaf,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { generateAgriculturalAlert } from "@/ai/flows/agricultural-alerts";
import { getCropRecommendation, CropRecommendationOutput } from "@/ai/flows/crop-recommendation";
import { predictYield } from "@/ai/flows/yield-prediction";
import { getMarketAnalysis, MarketAnalysisOutput } from "@/ai/flows/market-analysis";

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Forest", "Peaty", "Saline"];
const cropTypes = ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton"];
const weatherForecast = "Heavy rain expected in Rourkela for the next 2 days, followed by partly cloudy skies. Temperatures will be between 29-33°C.";

type Step =
  | "idle"
  | "alerts"
  | "recommendation_input"
  | "recommendation_output"
  | "prediction_input"
  | "prediction_output"
  | "analysis_input"
  | "analysis_output"
  | "calendar_input"
  | "calendar_output";


const recommendationSchema = z.object({
  soilType: z.string().min(1, "Please select a soil type."),
  state: z.string().min(1, "Please select a state."),
});

const predictionSchema = z.object({
  cropType: z.string().min(1, "Please select a crop type."),
  state: z.string().min(1, "Please select a state."),
  area: z.coerce.number().min(0.1, "Area must be greater than 0."),
  sowingDate: z.date({ required_error: "A sowing date is required." }),
});

const analysisSchema = z.object({
  cropName: z.string().min(1, "Please select a crop."),
});

const calendarSchema = z.object({
    crop: z.string().min(1, "Please select a crop"),
    sowingDate: z.date({ required_error: "A sowing date is required." }),
});

const riceTasks = [
    { days: 0, task: "Sowing & Transplanting" },
    { days: 15, task: "Weed Management" },
    { days: 25, task: "First Fertilizer Application (Nitrogen)" },
    { days: 45, task: "Pest & Disease Monitoring" },
    { days: 55, task: "Second Fertilizer Application" },
    { days: 80, task: "Flowering Stage Water Management" },
    { days: 110, task: "Pre-Harvest Water Drainage" },
    { days: 120, task: "Harvesting" },
];


export function FarmingCycleAssistant() {
  const [step, setStep] = useState<Step>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // State for outputs
  const [alert, setAlert] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);
  const [calendarTasks, setCalendarTasks] = useState<{date: Date; task: string}[]>([]);

  // State for shared inputs
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");

  const recommendationForm = useForm<z.infer<typeof recommendationSchema>>({ resolver: zodResolver(recommendationSchema) });
  const predictionForm = useForm<z.infer<typeof predictionSchema>>({ resolver: zodResolver(predictionSchema), defaultValues: { area: 1 } });
  const analysisForm = useForm<z.infer<typeof analysisSchema>>({ resolver: zodResolver(analysisSchema) });
  const calendarForm = useForm<z.infer<typeof calendarSchema>>({ resolver: zodResolver(calendarSchema), defaultValues: {sowingDate: new Date()} });
  

  const handleReset = () => {
    setStep("idle");
    setAlert(null);
    setRecommendations(null);
    setPrediction(null);
    setAnalysis(null);
    setCalendarTasks([]);
    recommendationForm.reset();
    predictionForm.reset({area: 1});
    analysisForm.reset();
    calendarForm.reset({sowingDate: new Date()});
  };

  const getAlert = async () => {
    setIsLoading(true);
    try {
      const result = await generateAgriculturalAlert({ weatherForecast });
      setAlert(result.alert);
      setStep("alerts");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch AI-powered advice." });
    }
    setIsLoading(false);
  };

  const getRecommendations = async (values: z.infer<typeof recommendationSchema>) => {
    setIsLoading(true);
    try {
      const result = await getCropRecommendation(values);
      setRecommendations(result.recommendations);
      setSelectedState(values.state);
      setStep("recommendation_output");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not get crop recommendations." });
    }
    setIsLoading(false);
  };
  
  const getPrediction = async (values: z.infer<typeof predictionSchema>) => {
    setIsLoading(true);
    try {
      const result = await predictYield({
        ...values,
        sowingDate: format(values.sowingDate, "yyyy-MM-dd"),
      });
      setPrediction(result.predictedYieldTonnesPerAcre);
      setStep("prediction_output");
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not get yield prediction." });
    }
    setIsLoading(false);
  }

  const getAnalysis = async (values: z.infer<typeof analysisSchema>) => {
    setIsLoading(true);
    try {
      const result = await getMarketAnalysis(values);
      setAnalysis(result);
      setStep("analysis_output");
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not get market analysis." });
    }
    setIsLoading(false);
  }

  const getCalendar = (values: z.infer<typeof calendarSchema>) => {
      const tasks = (values.crop.toLowerCase() === 'rice' ? riceTasks : []).map(t => ({
          date: addDays(values.sowingDate, t.days),
          task: t.task,
      }));
      setCalendarTasks(tasks);
      setStep("calendar_output");
  }


  const handleSelectCrop = (cropName: string) => {
    setSelectedCrop(cropName);
    predictionForm.setValue("cropType", cropName.toLowerCase());
    predictionForm.setValue("state", selectedState);
    analysisForm.setValue("cropName", cropName);
    calendarForm.setValue("crop", cropName.toLowerCase());
    setStep("prediction_input");
  }


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Farming Cycle Assistant</CardTitle>
        <CardDescription>Your guided journey from planning to profit.</CardDescription>
      </CardHeader>
      
      {/* Content for each step */}
      <CardContent className="flex-grow space-y-4">
        {step === "idle" && (
            <div className="text-center p-8">
                <Sparkles className="mx-auto h-12 w-12 text-primary/50" />
                <h3 className="mt-4 text-lg font-medium">Ready to plan your season?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Let's start by checking the latest alerts for your farm.
                </p>
            </div>
        )}
        
        {/* Step 1: Alerts */}
        {step === "alerts" && alert && (
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">AI-Powered Alert</h3>
                    <AlertTriangle className="h-6 w-6 text-accent" />
                </div>
                <p className="mt-2 text-foreground/90">{alert}</p>
            </div>
        )}
        
        {/* Step 2: Recommendations */}
        {(step === "recommendation_input" || step === "recommendation_output") && (
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">Crop Recommendation</h3>
                    <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                {step === "recommendation_input" && (
                     <Form {...recommendationForm}>
                        <form id="rec-form" onSubmit={recommendationForm.handleSubmit(getRecommendations)} className="space-y-4 mt-4">
                        <FormField control={recommendationForm.control} name="soilType" render={({ field }) => (<FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent>{soilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={recommendationForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        </form>
                    </Form>
                )}
                {step === "recommendation_output" && recommendations && (
                    <div className="mt-4 space-y-4">
                        {recommendations.map((rec, index) => (
                          <Card key={index} className="flex gap-4 p-3 items-start bg-card/50">
                             <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-2">
                                <Leaf className="w-5 h-5"/>
                            </div>
                            <div className="flex-grow">
                              <p className="font-semibold">{rec.cropName}</p>
                              <p className="text-sm text-muted-foreground">{rec.reason}</p>
                            </div>
                            <Button size="sm" onClick={() => handleSelectCrop(rec.cropName)}>Select</Button>
                          </Card>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Step 3: Yield Prediction */}
        {(step === "prediction_input" || step === "prediction_output") && (
             <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">AI Yield Prediction for {selectedCrop}</h3>
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                 {step === "prediction_input" && (
                    <Form {...predictionForm}>
                        <form id="pred-form" onSubmit={predictionForm.handleSubmit(getPrediction)} className="space-y-4 mt-4">
                            <FormField control={predictionForm.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Area (in acres)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Sowing Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        </form>
                    </Form>
                 )}
                {step === "prediction_output" && prediction !== null && (
                    <div className="text-center p-8">
                        <p className="text-muted-foreground">Predicted Yield</p>
                        <p className="text-4xl font-bold text-primary">{prediction.toFixed(2)}</p>
                        <p className="text-muted-foreground">tonnes/acre</p>
                    </div>
                )}
            </div>
        )}

        {/* Step 4: Market Analysis */}
        {(step === "analysis_input" || step === "analysis_output") && (
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">Market Analysis for {selectedCrop}</h3>
                    <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                {step === "analysis_input" && (
                    <div className="p-8 text-center">
                        <p className="text-muted-foreground">Ready to see the market trends for <span className="font-semibold text-foreground">{selectedCrop}</span>?</p>
                    </div>
                )}
                {step === "analysis_output" && analysis && (
                    <div className="mt-4">
                        <p className="font-medium text-foreground/90">{analysis.analysis}</p>
                    </div>
                )}
            </div>
        )}

        {/* Step 5: Crop Calendar */}
        {(step === "calendar_input" || step === "calendar_output") && (
            <div>
                 <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">Crop Calendar for {selectedCrop}</h3>
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                {step === "calendar_input" && (
                    <div className="p-8 text-center">
                         <p className="text-muted-foreground">Let's generate a task list to guide you through the season for <span className="font-semibold text-foreground">{selectedCrop}</span>.</p>
                    </div>
                )}
                {step === "calendar_output" && calendarTasks.length > 0 && (
                     <div className="mt-4 space-y-4 h-64 overflow-y-auto pr-2">
                        {calendarTasks.map((task, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center" />
                                    {index < calendarTasks.length - 1 && <Separator orientation="vertical" className="h-10 my-1" />}
                                </div>
                                <div>
                                    <p className="font-semibold">{task.task}</p>
                                    <p className="text-sm text-muted-foreground">{format(task.date, "do MMMM, yyyy")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </CardContent>
      
      <CardFooter className="flex-col items-stretch gap-2 pt-6">
        <Separator />
        <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleReset} disabled={isLoading || step === 'idle'}>
              Reset
            </Button>

            {/* Idle State */}
            {step === 'idle' && <Button onClick={getAlert} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Check Alerts</Button>}
            
            {/* Alerts State */}
            {step === 'alerts' && <Button onClick={() => setStep("recommendation_input")} disabled={isLoading}>Next: Get Crop Recommendation</Button>}
            
            {/* Recommendation State */}
            {step === 'recommendation_input' && <Button type="submit" form="rec-form" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Recommendations</Button>}

            {/* Prediction State */}
            {step === 'prediction_input' && <Button type="submit" form="pred-form" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict Yield</Button>}
            
            {/* Prediction Output State */}
            {step === 'prediction_output' && <Button onClick={() => setStep("analysis_input")} disabled={isLoading}>Next: Analyze Market</Button>}
            
            {/* Analysis Input State */}
            {step === 'analysis_input' && <Button onClick={analysisForm.handleSubmit(getAnalysis)} disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Market Analysis</Button>}

            {/* Analysis Output State */}
            {step === 'analysis_output' && <Button onClick={() => {
                const sowDate = predictionForm.getValues("sowingDate");
                if (sowDate) calendarForm.setValue("sowingDate", sowDate);
                getCalendar(calendarForm.getValues())
            }} disabled={isLoading || !predictionForm.getValues("sowDate")}>Finish: Create Calendar</Button>}
            
            {/* Final State */}
            {(step === 'recommendation_output' || step === 'calendar_output') && <Button onClick={handleReset}>Start Over</Button>}
        </div>
      </CardFooter>
    </Card>
  );
}
