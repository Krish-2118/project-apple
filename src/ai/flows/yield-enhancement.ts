'use server';
/**
 * @fileOverview An AI agent that provides tips to enhance crop yield.
 *
 * - getYieldEnhancementTips - A function that returns yield enhancement tips.
 * - YieldEnhancementInput - The input type for the getYieldEnhancementTips function.
 * - YieldEnhancementOutput - The return type for the getYieldEnhancementTips function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const YieldEnhancementInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., rice, wheat).'),
  soilType: z.string().describe('The type of soil in the field.'),
  state: z.string().describe('The Indian state where the field is located.'),
  predictedYield: z.number().describe('The currently predicted yield in tonnes per acre.'),
});
export type YieldEnhancementInput = z.infer<typeof YieldEnhancementInputSchema>;

const YieldEnhancementOutputSchema = z.object({
  tips: z.array(z.object({
    title: z.string().describe('The title of the enhancement tip.'),
    description: z.string().describe('A brief, actionable description of the tip.'),
  })).describe('A list of up to 3 tips to improve crop yield.'),
});
export type YieldEnhancementOutput = z.infer<typeof YieldEnhancementOutputSchema>;

export async function getYieldEnhancementTips(input: YieldEnhancementInput): Promise<YieldEnhancementOutput> {
  return yieldEnhancementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yieldEnhancementPrompt',
  input: { schema: YieldEnhancementInputSchema },
  output: { schema: YieldEnhancementOutputSchema },
  prompt: `You are an expert agricultural advisor in India.
  For a farmer growing {{{cropType}}} in {{{state}}} on {{{soilType}}} soil with a predicted yield of {{{predictedYield}}} tonnes/acre,
  provide up to 3 actionable, high-impact tips to enhance the yield.
  Focus on practical advice related to pest control, nutrient management, irrigation, or other relevant farming practices.
  For each tip, provide a clear title and a concise description.
  `,
});

const yieldEnhancementFlow = ai.defineFlow(
  {
    name: 'yieldEnhancementFlow',
    inputSchema: YieldEnhancementInputSchema,
    outputSchema: YieldEnhancementOutputSchema,
  },
  async input => {
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const { output } = await prompt(input);
    return output!;
  }
);
