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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { getCropRecommendation, CropRecommendationOutput } from "@/ai/flows/crop-recommendation";
import { predictYield, PredictYieldOutput } from "@/ai/flows/yield-prediction";
import { getMarketAnalysis, MarketAnalysisOutput } from "@/ai/flows/market-analysis";

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Forest", "Peaty", "Saline"];
const cropTypes = ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton"];

const recommendationSchema = z.object({
  soilType: z.string().min(1, "Please select a soil type."),
  state: z.string().min(1, "Please select a state."),
});

const predictionSchema = z.object({
  cropType: z.string().min(1, "Please select a crop type."),
  area: z.coerce.number().min(0.1, "Area must be greater than 0."),
  sowingDate: z.date({ required_error: "A sowing date is required." }),
  state: z.string().min(1, "Please select a state."),
});

const analysisSchema = z.object({
  cropName: z.string().min(1, "Please select a crop."),
});

type AssistantTab = "recommend" | "predict" | "analyze";

export function AiAssistant() {
  const [activeTab, setActiveTab] = useState<AssistantTab>("recommend");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);
  const [prediction, setPrediction] = useState<PredictYieldOutput | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);

  const recommendationForm = useForm<z.infer<typeof recommendationSchema>>({ resolver: zodResolver(recommendationSchema) });
  const predictionForm = useForm<z.infer<typeof predictionSchema>>({ resolver: zodResolver(predictionSchema), defaultValues: { area: 1, sowingDate: new Date() } });
  const analysisForm = useForm<z.infer<typeof analysisSchema>>({ resolver: zodResolver(analysisSchema) });

  const resetOutputs = () => {
    setRecommendations(null);
    setPrediction(null);
    setAnalysis(null);
  };

  const handleTabChange = (tab: string) => {
    resetOutputs();
    setActiveTab(tab as AssistantTab);
  }

  const getRecommendations = async (values: z.infer<typeof recommendationSchema>) => {
    setIsLoading(true);
    resetOutputs();
    try {
      const result = await getCropRecommendation(values);
      setRecommendations(result.recommendations);
      predictionForm.setValue("state", values.state);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not get crop recommendations." });
    }
    setIsLoading(false);
  };

  const getPrediction = async (values: z.infer<typeof predictionSchema>) => {
    setIsLoading(true);
    resetOutputs();
    try {
      const result = await predictYield({
        ...values,
        sowingDate: format(values.sowingDate, "yyyy-MM-dd"),
      });
      setPrediction(result);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not get yield prediction." });
    }
    setIsLoading(false);
  }

  const getAnalysis = async (values: z.infer<typeof analysisSchema>) => {
    setIsLoading(true);
    resetOutputs();
    try {
      const result = await getMarketAnalysis(values);
      setAnalysis(result);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not get market analysis." });
    }
    setIsLoading(false);
  }

  const handleSelectCrop = (cropName: string) => {
    predictionForm.setValue("cropType", cropName);
    analysisForm.setValue("cropName", cropName);
    setActiveTab("predict");
    resetOutputs();
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">AI Assistant</CardTitle>
        <CardDescription>Your suite of AI-powered farming tools.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommend">Crop Recommendation</TabsTrigger>
            <TabsTrigger value="predict">Yield Prediction</TabsTrigger>
            <TabsTrigger value="analyze">Market Analysis</TabsTrigger>
          </TabsList>
          <div className="p-6 border border-t-0 rounded-b-md">
            
            {/* Forms Section */}
            <div className="min-h-[16rem]">
              <TabsContent value="recommend">
                <Form {...recommendationForm}>
                  <form id="rec-form" onSubmit={recommendationForm.handleSubmit(getRecommendations)} className="space-y-4">
                    <p className="text-sm text-muted-foreground">Get crop suggestions based on your farm's conditions.</p>
                    <FormField control={recommendationForm.control} name="soilType" render={({ field }) => (<FormItem><FormLabel>Soil Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl><SelectContent>{soilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={recommendationForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="predict">
                 <Form {...predictionForm}>
                    <form id="pred-form" onSubmit={predictionForm.handleSubmit(getPrediction)} className="space-y-4">
                        <p className="text-sm text-muted-foreground">Predict the potential yield for your selected crop and area.</p>
                        <FormField control={predictionForm.control} name="cropType" render={({ field }) => (<FormItem><FormLabel>Crop</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{[...cropTypes, ...recommendations?.map(r => r.cropName) || []].filter((v,i,a)=>a.indexOf(v)==i).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={predictionForm.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Area (in acres)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Sowing Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}>{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        <FormField control={predictionForm.control} name="state" render={({ field }) => (<FormItem hidden><FormLabel>State</FormLabel><Input {...field} /><FormMessage /></FormItem>)} />
                    </form>
                </Form>
              </TabsContent>

              <TabsContent value="analyze">
                 <Form {...analysisForm}>
                    <form id="analysis-form" onSubmit={analysisForm.handleSubmit(getAnalysis)} className="space-y-4">
                        <p className="text-sm text-muted-foreground">Get market insights for a specific crop.</p>
                        <FormField control={analysisForm.control} name="cropName" render={({ field }) => (<FormItem><FormLabel>Crop</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{[...cropTypes, ...recommendations?.map(r => r.cropName) || []].filter((v,i,a)=>a.indexOf(v)==i).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </form>
                </Form>
              </TabsContent>
            </div>

            <div className="flex justify-end mt-4">
                 {activeTab === "recommend" && <Button type="submit" form="rec-form" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Recommendations</Button>}
                 {activeTab === "predict" && <Button type="submit" form="pred-form" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict Yield</Button>}
                 {activeTab === "analyze" && <Button type="submit" form="analysis-form" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Get Analysis</Button>}
            </div>

            {/* Results Section */}
            {(recommendations || prediction || analysis) && (
              <div className="mt-6 pt-6 border-t">
                  {recommendations && (
                     <div>
                        <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Crop Recommendations</h3>
                        <div className="mt-4 space-y-3">
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
                    </div>
                  )}
                  {prediction && (
                     <div className="text-center">
                        <h3 className="font-semibold flex items-center justify-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" /> AI Yield Prediction</h3>
                        <p className="text-muted-foreground">Predicted Yield</p>
                        <p className="text-4xl font-bold text-primary">{prediction.predictedYieldTonnesPerAcre.toFixed(2)}</p>
                        <p className="text-muted-foreground">tonnes/acre</p>
                    </div>
                  )}
                  {analysis && (
                     <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><TrendingUp className="h-5 w-5 text-accent" /> Market Analysis</h3>
                        <p className="text-sm text-foreground/90">{analysis.analysis}</p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
