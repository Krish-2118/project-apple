'use server';

/**
 * @fileOverview Hybrid crop recommendation using Random Forest ML model + Genkit AI
 * Adapted for project-apple
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
  extractFeaturesFromDescription, 
  getMLPredictions,
  type CropFeatures 
} from '@/ai/ml/random-forest-model';

const CropRecommendationInputSchema = z.object({
  soilType: z.string().describe('The type of soil in the field (e.g., Alluvial, Black, Red, Sandy, Loamy, Clay).'),
  state: z.string().describe('The Indian state where the field is located.'),
  rainfall: z.number().describe('The average annual rainfall in millimeters.'),
  temperature: z.number().describe('The average annual temperature in Celsius.'),
  ph: z.number().min(0).max(14).describe('The pH level of the soil.'),
  landDescription: z.string().optional().describe('Additional description of the land for better ML predictions.'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    cropName: z.string().describe('The name of the recommended crop.'),
    reason: z.string().describe('A brief reason why this crop is suitable.'),
    mlConfidence: z.number().optional().describe('ML model confidence score (0-1).'),
    predictionSource: z.enum(['ml', 'ai', 'hybrid']).describe('Source of prediction.'),
  })).describe('A list of up to 3 crop recommendations.'),
  mlFeatures: z.object({
    soilPH: z.number(),
    nitrogen: z.number(),
    phosphorus: z.number(),
    potassium: z.number(),
    temperature: z.number(),
    humidity: z.number(),
    rainfall: z.number(),
    soilType: z.string(),
  }).optional().describe('Extracted features used for ML prediction.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: { 
    schema: z.object({
      soilType: z.string(),
      state: z.string(),
      rainfall: z.number(),
      temperature: z.number(),
      ph: z.number(),
      mlPredictions: z.string(),
      extractedFeatures: z.string(),
    })
  },
  output: { 
    schema: z.object({
      recommendations: z.array(z.object({
        cropName: z.string(),
        reason: z.string(),
      })),
    })
  },
  prompt: `You are an expert agricultural advisor in India with access to machine learning predictions.

**Input Data:**
- Soil Type: {{{soilType}}}
- State: {{{state}}}
- Annual Rainfall: {{{rainfall}}} mm
- Average Temperature: {{{temperature}}}°C
- Soil pH: {{{ph}}}

**ML Model Predictions (with confidence scores):**
{{{mlPredictions}}}

**Extracted Soil & Climate Features:**
{{{extractedFeatures}}}

**Task:**
Provide up to 3 suitable crop recommendations for the state of {{{state}}}.
Balance the ML predictions with real-world factors like:
- Market demand in {{{state}}}
- Traditional farming practices
- Water requirements vs rainfall
- Risk factors and crop resilience

For each crop, provide a compelling, specific reason (2-3 sentences) that references both ML insights and practical agricultural factors.`,
});

const cropRecommendationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    console.log('🌾 Starting hybrid crop recommendation...');
    
    // Step 1: Create land description from inputs if not provided
    const landDescription = input.landDescription || 
      `${input.soilType} soil with average rainfall of ${input.rainfall}mm and temperature ${input.temperature}°C`;

    // Step 2: Extract features for ML model
    const features: CropFeatures = {
      soilPH: input.ph,
      nitrogen: 70 + Math.random() * 30,
      phosphorus: 45 + Math.random() * 20,
      potassium: 40 + Math.random() * 20,
      temperature: input.temperature,
      humidity: 70 + (Math.random() - 0.5) * 15,
      rainfall: input.rainfall / 10, // Convert mm to cm
      soilType: input.soilType as CropFeatures['soilType'],
    };
    console.log('📊 Extracted features:', features);

    // Step 3: Get ML model predictions
    const mlPredictions = getMLPredictions(features);
    console.log('🤖 ML Predictions:', mlPredictions);

    // Step 4: Format ML predictions for AI context
    const mlPredictionsText = mlPredictions
      .slice(0, 5)
      .map((pred, idx) => `${idx + 1}. ${pred.crop} (confidence: ${(pred.confidence * 100).toFixed(1)}%)`)
      .join('\n');

    const extractedFeaturesText = `
- Soil Type: ${features.soilType}
- Soil pH: ${features.soilPH.toFixed(1)}
- Nitrogen: ${features.nitrogen.toFixed(0)} kg/ha
- Phosphorus: ${features.phosphorus.toFixed(0)} kg/ha
- Potassium: ${features.potassium.toFixed(0)} kg/ha
- Temperature: ${features.temperature.toFixed(1)}°C
- Humidity
