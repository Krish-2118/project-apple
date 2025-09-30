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
  soilType: z.string().describe('The type of soil in the field.'),
  sowingDate: z.string().describe('The sowing date of the crop (YYYY-MM-DD).'),
});
export type PredictYieldInput = z.infer<typeof PredictYieldInputSchema>;

const PredictYieldOutputSchema = z.object({
  predictedYieldTonnesPerAcre: z
    .number()
    .describe('The predicted yield in tonnes per acre.'),
});
export type PredictYieldOutput = z.infer<typeof PredictYieldOutputSchema>;


const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    // Simulate a short delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 800));
    const prediction = getRealisticPrediction(input);
    return prediction;
  }
);


export async function predictYield(input: PredictYieldInput): Promise<PredictYieldOutput> {
  return predictYieldFlow(input);
}


const getRealisticPrediction = (input: PredictYieldInput): PredictYieldOutput => {
  // Base yields (tonnes/acre) for different crops - somewhat aligned with Indian averages
  const baseYields: {[key: string]: number} = {
    'rice': 2.4, 'wheat': 3.0, 'maize': 2.5, 'sugarcane': 32, 'cotton': 0.5, 'jute': 1.5, 'groundnut': 1.2, 'pulses': 0.8,
    'default': 1.8
  };
  let baseYield = baseYields[input.cropType.toLowerCase()] || baseYields['default'];

  // State-wise productivity modifiers (example values, Odisha focused)
  const stateModifiers: {[key:string]: number} = {
    'Odisha': 1.0, // Baseline for our focus state
    'Punjab': 1.25, 'Haryana': 1.2, 'Uttar Pradesh': 1.1,
    'Andhra Pradesh': 1.1, 'Tamil Nadu': 1.1, 'West Bengal': 1.05,
    'Madhya Pradesh': 0.9, 'Rajasthan': 0.8, 'Maharashtra': 0.85,
    'default': 1.0
  };
  const stateModifier = stateModifiers[input.state] || stateModifiers['default'];
  
  // Soil type modifiers (example values)
  const soilModifiers: {[key: string]: number} = {
      'alluvial': 1.1, 'red': 1.0, 'laterite': 0.9, 'black': 1.05, 'coastal saline': 0.85,
      'default': 1.0
  }
  const soilModifier = soilModifiers[input.soilType.toLowerCase()] || soilModifiers['default'];


  // Sowing date impact (simplified model based on month)
  const sowingMonth = new Date(input.sowingDate).getMonth() + 1; // 1-12
  let sowingFactor = 1.0;
  
  // Kharif crops (like Rice) are sown June-July in Odisha
  if (input.cropType.toLowerCase() === 'rice') {
    if (sowingMonth >= 6 && sowingMonth <= 8) sowingFactor = 1.1; // Optimal sowing for Kharif rice
    else sowingFactor = 0.85; // Penalty for off-season sowing
  } 
  // Rabi crops (like Wheat, Pulses) are sown Oct-Dec
  else if (['wheat', 'pulses'].includes(input.cropType.toLowerCase())) {
     if (sowingMonth >= 10 && sowingMonth <= 12) sowingFactor = 1.05;
     else sowingFactor = 0.9;
  }

  // Random environmental/unmodeled factor to represent real-world variability
  const randomFactor = 1 + (Math.random() - 0.5) * 0.15; // +/- 7.5% variance

  const predictedYield = baseYield * stateModifier * soilModifier * sowingFactor * randomFactor;
  
  return {
    predictedYieldTonnesPerAcre: parseFloat(predictedYield.toFixed(2)),
  };
};
