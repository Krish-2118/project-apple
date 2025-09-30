"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { TrendingUp, Loader2 } from "lucide-react";
import { getMarketAnalysis, MarketAnalysisOutput } from "@/ai/flows/market-analysis";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  cropName: z.string().min(1, "Please select a crop."),
});

type FormValues = z.infer<typeof formSchema>;

const cropTypes = ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Soybean", "Pulses"];

export function MarketAnalysisCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await getMarketAnalysis(values);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Could not get market analysis at this time.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline">Market Analysis</CardTitle>
            <CardDescription>Get AI insights on crop prices</CardDescription>
          </div>
          <TrendingUp className="h-6 w-6 text-accent" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing market data...</span>
          </div>
        ) : analysis ? (
          <div>
            <p className="font-medium text-foreground/90">{analysis.analysis}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cropName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Crop</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select crop for analysis" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cropTypes.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={analysis ? () => setAnalysis(null) : form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {analysis ? "Analyze Another Crop" : "Get Market Analysis"}
        </Button>
      </CardFooter>
    </Card>
  );
}
