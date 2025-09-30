// src/ai/flows/yield-prediction.ts
'use server';
/**
 * @fileOverview A flow for predicting crop yield based on various factors.
 *
 * - predictYield - A function that takes crop details and returns a yield prediction.
 * - PredictYieldInput - The input type for the predictYield function.
 * - PredictYieldOutput - The return type for the predictYield function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictYieldInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., rice, wheat).'),
  state: z.string().describe('The state where the crop is being grown.'),
  area: z.number().describe('The area of the land in acres.'),
  sowingDate: z.string().describe('The sowing date of the crop (YYYY-MM-DD).'),
});
export type PredictYieldInput = z.infer<typeof PredictYieldInputSchema>;

const PredictYieldOutputSchema = z.object({
  predictedYieldTonnesPerAcre: z
    .number()
    .describe('The predicted yield in tonnes per acre.'),
});
export type PredictYieldOutput = z.infer<typeof PredictYieldOutputSchema>;

export async function predictYield(input: PredictYieldInput): Promise<PredictYieldOutput> {
  return predictYieldFlow(input);
}

// More realistic dummy data generation
const getRealisticPrediction = (input: PredictYieldInput): PredictYieldOutput => {
  // Base yields (tonnes/acre) for different crops - somewhat aligned with Indian averages
  const baseYields: {[key: string]: number} = {
    'rice': 2.4,
    'wheat': 3.0,
    'maize': 2.5,
    'sugarcane': 32,
    'cotton': 0.5,
    'default': 1.8
  };
  let baseYield = baseYields[input.cropType.toLowerCase()] || baseYields['default'];

  // State-wise productivity modifiers (example values)
  const stateModifiers: {[key: string]: number} = {
    'Punjab': 1.2, 'Haryana': 1.15, 'Uttar Pradesh': 1.05,
    'Andhra Pradesh': 1.1, 'Tamil Nadu': 1.1, 'West Bengal': 1.0,
    'Madhya Pradesh': 0.9, 'Rajasthan': 0.8, 'Maharashtra': 0.85,
    'default': 1.0
  };
  const stateModifier = stateModifiers[input.state] || stateModifiers['default'];

  // Sowing date impact (very simplified model)
  // Assume ideal sowing in a certain month range gives a bonus
  const sowingMonth = new Date(input.sowingDate).getMonth() + 1; // 1-12
  let sowingFactor = 1.0;
  
  if (input.cropType.toLowerCase() === 'wheat' && (sowingMonth < 10 || sowingMonth > 12)) {
    sowingFactor = 0.85; // Penalty for off-season sowing
  } else if (input.cropType.toLowerCase() === 'rice' && (sowingMonth < 6 || sowingMonth > 8)) {
    sowingFactor = 0.9;
  }

  // Area factor (minor non-linear effect)
  const areaFactor = 1 + (Math.log10(Math.max(1, input.area)) / 20); // small bonus for larger area, capped

  // Random environmental/unmodeled factor
  const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // +/- 5% variance

  const predictedYield = baseYield * stateModifier * sowingFactor * areaFactor * randomFactor;
  
  return {
    predictedYieldTonnesPerAcre: parseFloat(predictedYield.toFixed(2)),
  };
};

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    // Simulate a short delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 600));
    // Return more realistic dummy data
    const prediction = getRealisticPrediction(input);
    return prediction;
  }
);
