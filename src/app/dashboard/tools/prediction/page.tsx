'use client';

import { Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { predictYield } from '@/ai/flows/yield-prediction';
import { getMarketAnalysis } from '@/ai/flows/market-analysis';
import { getYieldEnhancementTips } from '@/ai/flows/yield-enhancement';
import { getPlaceHolderImage } from "@/lib/placeholder-images";
import Image from "next/image";

const cropTypes = ["Rice", "Maize", "Jute", "Groundnut", "Pulses", "Sugarcane", "Wheat", "Cotton"];
const sowingMonths = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

const cropEmojis: { [key: string]: string } = {
  "rice": "🌾", "wheat": "🌾", "maize": "🌽", "jute": "🌿", "cotton": "⚪",
  "sugarcane": "🎋", "pulses": "🫘", "groundnut": "🥜", "custom": "🌱", "default": "🌱",
};

const predictionSchema = z.object({
  cropType: z.string().min(1, 'Please select a crop type.'),
  sowingDate: z.string().min(1, 'Please select a sowing month.'),
});

type PredictionFormValues = z.infer<typeof predictionSchema>;

function PredictionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const formInputs = useMemo(() => ({
      crop: searchParams.get('crop') || 'custom',
      state: searchParams.get('state') || 'Odisha',
      soilType: searchParams.get('soilType') || '',
  }), [searchParams]);

  const predictionForm = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      cropType: formInputs.crop === 'custom' ? '' : formInputs.crop,
      sowingDate: '',
    },
  });

  useEffect(() => {
    const cropFromUrl = searchParams.get('crop');
    if (cropFromUrl && cropFromUrl !== 'custom') {
      predictionForm.setValue('cropType', cropFromUrl);
    }
  }, [searchParams, predictionForm]);

  const handleGetPrediction = async (values: PredictionFormValues) => {
    setIsLoading(true);

    const monthIndex = sowingMonths.indexOf(values.sowingDate);
    const fullDate = new Date(new Date().getFullYear(), monthIndex, 15); // Use 15th to be safe
    
    const predictionBaseInput = {
        cropType: values.cropType,
        state: formInputs.state,
        soilType: formInputs.soilType,
        sowingDate: format(fullDate, 'yyyy-MM-dd'),
    }

    if (!predictionBaseInput.soilType) {
        toast({ variant: "destructive", title: "Missing Information", description: "Soil type is required. Please go back and select it." });
        setIsLoading(false);
        return;
    }

    try {
      // Run all AI models in parallel
      const [yieldResult, marketResult, tipsResult] = await Promise.all([
        predictYield(predictionBaseInput),
        getMarketAnalysis({ cropName: values.cropType, state: formInputs.state }),
        getYieldEnhancementTips({ ...predictionBaseInput, predictedYield: 0 }), // predictedYield is not needed for tips
      ]);

      const results = {
        yieldResult,
        marketResult,
        tipsResult,
        userInput: predictionBaseInput,
      };
      
      sessionStorage.setItem('analysisResults', JSON.stringify(results));
      router.push('/dashboard/tools/results');

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch all insights. Please try again.' });
      console.error(error);
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    router.push('/dashboard/tools');
  };

  const selectedCrop = predictionForm.watch('cropType');
  const cropEmoji = cropEmojis[selectedCrop.toLowerCase() as keyof typeof cropEmojis] || cropEmojis['default'];
  const placeholderImage = getPlaceHolderImage(selectedCrop);

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Recommendations</Button>
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
                    <CardDescription>Step 2: Provide Sowing Details for Prediction & Analysis</CardDescription>
                    <div className="text-xs text-muted-foreground mt-2 space-x-4">
                        <span>State: <strong>{formInputs.state}</strong></span>
                        {formInputs.soilType && <span>Soil: <strong>{formInputs.soilType}</strong></span>}
                    </div>
                 </div>
            </div>
            <CardContent className="p-6">
                <div className="p-6 border rounded-lg">
                     <h3 className="text-lg font-semibold mb-4">Provide Sowing Details</h3>
                     <Form {...predictionForm}>
                        <form onSubmit={predictionForm.handleSubmit(handleGetPrediction)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <FormField control={predictionForm.control} name="cropType" render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>Selected Crop</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{[...new Set(cropTypes)].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={predictionForm.control} name="sowingDate" render={({ field }) => ( <FormItem className="md:col-span-1"><FormLabel>Sowing Month</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a month" /></SelectTrigger></FormControl><SelectContent>{sowingMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <div className="flex justify-end md:col-start-3">
                               <Button type="submit" disabled={isLoading || !predictionForm.formState.isValid} className="w-full md:w-auto">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Predict & Analyze</Button>
                            </div>
                        </form>
                    </Form>
                </div>
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
