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
    // Simulate a short delay to mimic a complex model running
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // This function simulates a more complex prediction model.
    // In a real-world scenario, this would be a call to a trained ML model.
    const prediction = getRealisticPrediction(input);
    
    return prediction;
  }
);


export async function predictYield(input: PredictYieldInput): Promise<PredictYieldOutput> {
  return predictYieldFlow(input);
}


/**
 * Simulates a realistic yield prediction based on various factors for Odisha.
 * This is a placeholder for a real machine learning model.
 */
const getRealisticPrediction = (input: PredictYieldInput): PredictYieldOutput => {
  // Base yields (tonnes/acre) for different crops - somewhat aligned with Indian averages
  const baseYields: {[key: string]: number} = {
    'rice': 2.4, 'wheat': 3.0, 'maize': 2.5, 'sugarcane': 32, 'cotton': 0.5, 'jute': 1.5, 'groundnut': 1.2, 'pulses': 0.8,
    'default': 1.8
  };
  let baseYield = baseYields[input.cropType.toLowerCase()] || baseYields['default'];

  // State-wise productivity modifiers (example values, Odisha focused)
  // A real model would have more granular data.
  const stateModifiers: {[key:string]: number} = {
    'Odisha': 1.0, // Baseline for our focus state
    'Punjab': 1.25, 
    'Haryana': 1.2, 
    'Uttar Pradesh': 1.1,
    'default': 1.0
  };
  const stateModifier = stateModifiers[input.state] || stateModifiers['default'];
  
  // Soil type modifiers specific to Odisha (example values)
  const soilModifiers: {[key: string]: number} = {
      'alluvial': 1.1, 
      'red': 1.0, 
      'laterite': 0.9, 
      'black': 1.05, 
      'coastal saline': 0.85,
      'default': 1.0
  }
  const soilModifier = soilModifiers[input.soilType.toLowerCase()] || soilModifiers['default'];


  // Sowing date impact (simplified model based on month for Odisha's climate)
  const sowingMonth = new Date(input.sowingDate).getMonth() + 1; // 1-12
  let sowingFactor = 1.0;
  
  // Kharif crops (like Rice, Jute, Maize) are typically sown June-July in Odisha
  if (['rice', 'jute', 'maize', 'groundnut'].includes(input.cropType.toLowerCase())) {
    if (sowingMonth >= 6 && sowingMonth <= 8) sowingFactor = 1.1; // Optimal sowing for Kharif
    else if (sowingMonth >= 9 && sowingMonth <=10) sowingFactor = 0.9; // Late sowing
    else sowingFactor = 0.75; // Off-season sowing penalty
  } 
  // Rabi crops (like Wheat, Pulses) are sown Oct-Dec
  else if (['wheat', 'pulses'].includes(input.cropType.toLowerCase())) {
     if (sowingMonth >= 10 && sowingMonth <= 12) sowingFactor = 1.05; // Optimal Rabi sowing
     else sowingFactor = 0.8; // Off-season
  }

  // Random environmental/unmodeled factor to represent real-world variability
  // e.g., unexpected pest attacks, minor weather deviations
  const randomFactor = 1 + (Math.random() - 0.5) * 0.15; // Adds a +/- 7.5% variance

  const predictedYield = baseYield * stateModifier * soilModifier * sowingFactor * randomFactor;
  
  return {
    predictedYieldTonnesPerAcre: parseFloat(predictedYield.toFixed(2)),
  };
};
