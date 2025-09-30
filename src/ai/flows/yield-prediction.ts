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

// Dummy data generation function
const getDummyPrediction = (input: PredictYieldInput): PredictYieldOutput => {
  // Simple logic to generate a somewhat realistic but random yield
  let baseYield = 0;
  switch (input.cropType.toLowerCase()) {
    case 'rice':
      baseYield = 2.5;
      break;
    case 'wheat':
      baseYield = 2.0;
      break;
    case 'maize':
      baseYield = 3.0;
      break;
    case 'sugarcane':
      baseYield = 30;
      break;
    case 'cotton':
      baseYield = 0.5;
      break;
    default:
      baseYield = 1.5;
  }
  // Add some variability based on other inputs
  const stateFactor = (input.state.length % 5) * 0.1; // 0 to 0.4
  const areaFactor = Math.min(input.area / 10, 1) * 0.2; // 0 to 0.2
  const randomFactor = Math.random() * 0.5 - 0.25; // -0.25 to 0.25

  const predictedYield = baseYield + stateFactor + areaFactor + randomFactor;

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
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return dummy data instead of calling an external tool
    const prediction = getDummyPrediction(input);
    return prediction;
  }
);
