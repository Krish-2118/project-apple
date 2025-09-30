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
import { BrainCircuit, Loader2, Leaf } from "lucide-react";
import { getCropRecommendation, CropRecommendationOutput } from "@/ai/flows/crop-recommendation";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  soilType: z.string().min(1, "Please select a soil type."),
  state: z.string().min(1, "Please select a state."),
});

type FormValues = z.infer<typeof formSchema>;

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Forest", "Peaty", "Saline"];

export function CropRecommendationCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationOutput['recommendations'] | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await getCropRecommendation(values);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Recommendation failed:", error);
      toast({
        variant: "destructive",
        title: "Recommendation Error",
        description: "Could not get a recommendation at this time.",
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
            <CardTitle className="font-headline">Crop Recommendation</CardTitle>
            <CardDescription>Find the best crops for your soil</CardDescription>
          </div>
          <BrainCircuit className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Finding best crops...</span>
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex gap-4 items-start">
                 <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-2">
                    <Leaf className="w-5 h-5"/>
                </div>
                <div>
                  <p className="font-semibold">{rec.cropName}</p>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilTypes.map(soil => <SelectItem key={soil} value={soil}>{soil}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
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
      <CardFooter className="flex-col items-stretch gap-2 pt-6">
        {recommendations && <Separator />}
        <Button
          type="button"
          onClick={recommendations ? () => setRecommendations(null) : form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {recommendations ? "Check Again" : "Get Recommendation"}
        </Button>
      </CardFooter>
    </Card>
  );
}
