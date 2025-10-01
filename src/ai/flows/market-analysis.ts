'use server';

/**
 * @fileOverview Market analysis flow for project-apple
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketAnalysisInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to analyze.'),
  state: z.string().describe('The state in India, e.g., Odisha.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;

const MarketAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A concise market analysis including current MSP, price trends, and demand forecast.'),
  mandiPrices: z.array(z.object({
    mandiName: z.string().describe('The name of the agricultural market (mandi).'),
    price: z.string().describe('The current price of the crop in that mandi, formatted as a string (e.g., "₹5,500 - ₹6,000 per quintal").'),
  })).describe('A list of prices from up to 3 nearby mandis.'),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst for India.
  For the crop {{{cropName}}} in the state of {{{state}}}, provide a brief, actionable market analysis.
  Include current MSP (if any), general price trends (last 3-6 months), and demand forecast for the next season.
  Also, provide a list of current prices from up to 3 major or nearby mandis (agricultural markets) within or near {{{state}}}.
  Provide realistic but varied price ranges for each mandi.

  Crop: {{{cropName}}}
  State: {{{state}}}
  `,
});

const marketAnalysisFlow = ai.defineFlow(
  {
    name: 'marketAnalysisFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function getMarketAnalysis(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return marketAnalysisFlow(input);
}
