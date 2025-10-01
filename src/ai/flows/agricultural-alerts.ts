'use server';

/**
 * @fileOverview Agricultural alerts flow for project-apple
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AgriculturalAlertInputSchema = z.object({
  weatherForecast: z.string().describe('The weather forecast for the next few days.'),
});
export type AgriculturalAlertInput = z.infer<typeof AgriculturalAlertInputSchema>;

const AgriculturalAlertOutputSchema = z.object({
  alert: z.string().describe('An actionable alert or advice for farmers based on the weather forecast.'),
});
export type AgriculturalAlertOutput = z.infer<typeof AgriculturalAlertOutputSchema>;

const prompt = ai.definePrompt({
  name: 'agriculturalAlertPrompt',
  input: { schema: AgriculturalAlertInputSchema },
  output: { schema: AgriculturalAlertOutputSchema },
  prompt: `You are an AI assistant providing actionable advice to farmers based on weather forecasts.
  Given the following weather forecast, provide a single, concise alert or advice to help them make informed decisions about their farming practices.

  Weather Forecast: {{{weatherForecast}}}

  Alert:
  `,
});

const agriculturalAlertFlow = ai.defineFlow(
  {
    name: 'agriculturalAlertFlow',
    inputSchema: AgriculturalAlertInputSchema,
    outputSchema: AgriculturalAlertOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateAgriculturalAlert(input: AgriculturalAlertInput): Promise<AgriculturalAlertOutput> {
  return agriculturalAlertFlow(input);
}
