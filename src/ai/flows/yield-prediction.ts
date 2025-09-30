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

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    // Call the external prediction API using a tool.
    const prediction = await getYieldPrediction(input);
    return prediction;
  }
);

const getYieldPrediction = ai.defineTool(
  {
    name: 'getYieldPrediction',
    description: 'Calls an external API to predict crop yield based on crop type, location, area, and sowing date.',
    inputSchema: PredictYieldInputSchema,
    outputSchema: PredictYieldOutputSchema,
  },
  async input => {
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as PredictYieldOutput;
  }
);
