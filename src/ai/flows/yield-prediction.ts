'use server';

/**
 * @fileOverview Yield prediction flow for project-apple
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictYieldInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., rice, wheat).'),
  state: z.string().describe('The state where the crop is being grown.'),
  soilType: z.string().describe('The type of soil in the field.'),
  sowingDate: z.string().describe('The sowing date of the crop (YYYY-MM-DD).'),
});
export type PredictYieldInput = z.infer<typeof PredictYieldInputSchema>;

const PredictYieldOutputSchema = z.object({
  predictedYieldTonnesPerAcre: z.number().describe('The predicted yield in tonnes per acre.'),
});
export type PredictYieldOutput = z.infer<typeof PredictYieldOutputSchema>;

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const prediction = getRealisticPrediction(input);
    return prediction;
  }
);

export async function predictYield(input: PredictYieldInput): Promise<PredictYieldOutput> {
  return predictYieldFlow(input);
}

const getRealisticPrediction = (input: PredictYieldInput): PredictYieldOutput => {
  const baseYields: {[key: string]: number} = {
    'rice': 2.4, 'wheat': 3.0, 'maize': 2.5, 'sugarcane': 32, 'cotton': 0.5, 
    'jute': 1.5, 'groundnut': 1.2, 'pulses': 0.8, 'default': 1.8
  };
  let baseYield = baseYields[input.cropType.toLowerCase()] || baseYields['default'];

  const stateModifiers: {[key:string]: number} = {
    'Odisha': 1.0, 'Punjab': 1.25, 'Haryana': 1.2, 'Uttar Pradesh': 1.1, 'default': 1.0
  };
  const stateModifier = stateModifiers[input.state] || stateModifiers['default'];
  
  const soilModifiers: {[key: string]: number} = {
    'alluvial': 1.1, 'red': 1.0, 'laterite': 0.9, 'black': 1.05, 
    'coastal saline': 0.85, 'loamy': 1.05, 'sandy': 0.95, 'clay': 1.0, 'default': 1.0
  }
  const soilModifier = soilModifiers[input.soilType.toLowerCase()] || soilModifiers['default'];

  const sowingMonth = new Date(input.sowingDate).getMonth() + 1;
  let sowingFactor = 1.0;
  
  if (['rice', 'jute', 'maize', 'groundnut'].includes(input.cropType.toLowerCase())) {
    if (sowingMonth >= 6 && sowingMonth <= 8) sowingFactor = 1.1;
    else if (sowingMonth >= 9 && sowingMonth <=10) sowingFactor = 0.9;
    else sowingFactor = 0.75;
  } else if (['wheat', 'pulses'].includes(input.cropType.toLowerCase())) {
     if (sowingMonth >= 10 && sowingMonth <= 12) sowingFactor = 1.05;
     else sowingFactor = 0.8;
  }

  const randomFactor = 1 + (Math.random() - 0.5) * 0.15;
  const predictedYield = baseYield * stateModifier * soilModifier * sowingFactor * randomFactor;
  
  return {
    predictedYieldTonnesPerAcre: parseFloat(predictedYield.toFixed(2)),
  };
};
