'use server';

/**
 * @fileOverview An AI agent that provides crop recommendations based on soil type, state, and other environmental factors.
 *
 * - getCropRecommendation - A function that returns crop recommendations.
 * - CropRecommendationInput - The input type for the getCropRecommendation function.
 * - CropRecommendationOutput - The return type for the getCropRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CropRecommendationInputSchema = z.object({
  soilType: z.string().describe('The type of soil in the field (e.g., Alluvial, Black, Red, Sandy).'),
  state: z.string().describe('The Indian state where the field is located.'),
  rainfall: z.number().describe('The average annual rainfall in millimeters.'),
  temperature: z.number().describe('The average annual temperature in Celsius.'),
  ph: z.number().min(0).max(14).describe('The pH level of the soil.'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    cropName: z.string().describe('The name of the recommended crop.'),
    reason: z.string().describe('A brief reason why this crop is suitable.'),
  })).describe('A list of up to 3 crop recommendations.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function getCropRecommendation(input: CropRecommendationInput): Promise<CropRecommendationOutput> {
  return cropRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: { schema: CropRecommendationInputSchema },
  output: { schema: CropRecommendationOutputSchema },
  prompt: `You are an expert agricultural advisor in India.
  Based on the given soil type, state, rainfall, temperature, and soil pH, provide a list of up to 3 suitable crop recommendations.
  Focus on crops that are viable and profitable in the state of {{{state}}}.
  For each crop, provide a short, compelling reason why it's a good choice for the specified conditions.

  Soil Type: {{{soilType}}}
  State: {{{state}}}
  Annual Rainfall: {{{rainfall}}} mm
  Average Temperature: {{{temperature}}} C
  Soil pH: {{{ph}}}
  `,
});

const cropRecommendationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
