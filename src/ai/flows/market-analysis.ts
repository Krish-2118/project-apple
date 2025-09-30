'use server';

/**
 * @fileOverview An AI agent that provides market analysis for a given crop.
 *
 * - getMarketAnalysis - A function that returns market analysis.
 * - MarketAnalysisInput - The input type for the getMarketAnalysis function.
 * - MarketAnalysisOutput - The return type for the getMarketAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const MarketAnalysisInputSchema = z.object({
  cropName: z.string().describe('The name of the crop to analyze.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;

export const MarketAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A concise market analysis including current price trends, demand, and selling advice.'),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

export async function getMarketAnalysis(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return marketAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst in India.
  Provide a brief, actionable market analysis for the following crop: {{{cropName}}}.
  Include current MSP (if any), general price trends in major markets, demand forecast, and one key piece of advice on when or where to sell.
  Keep the entire analysis to about 3-4 sentences.
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
