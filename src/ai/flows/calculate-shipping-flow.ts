'use server';
/**
 * @fileOverview Calculates a flat shipping cost.
 * - calculateShipping - a function that calculates a flat shipping fee.
 * - ShippingInput - The input type for the calculateShipping function.
 * - ShippingOutput - The return type for the calculateShipping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { allowedNeighborhoods } from '@/lib/data/shipping-neighborhoods';

const ShippingInputSchema = z.object({
  neighborhood: z.string().describe("The client's neighborhood for delivery."),
});
export type ShippingInput = z.infer<typeof ShippingInputSchema>;

const ShippingOutputSchema = z.object({
  fee: z.number().describe('The calculated shipping fee.'),
  error: z.string().optional().describe('An error message if calculation fails.'),
});
export type ShippingOutput = z.infer<typeof ShippingOutputSchema>;

const normalizeString = (str: string) => {
    return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const calculateShippingFlow = ai.defineFlow(
  {
    name: 'calculateShippingFlow',
    inputSchema: ShippingInputSchema,
    outputSchema: ShippingOutputSchema,
  },
  async (input) => {
    if (!input.neighborhood) {
        return { fee: 0, error: 'Bairro não informado.' };
    }

    const normalizedInput = normalizeString(input.neighborhood);
    const isAllowed = allowedNeighborhoods.some(n => normalizeString(n) === normalizedInput);
    
    if (isAllowed) {
      return { fee: 10.00 };
    } else {
      return { fee: 0, error: 'Não entregamos neste bairro.' };
    }
  }
);

export async function calculateShipping(input: ShippingInput): Promise<ShippingOutput> {
    return calculateShippingFlow(input);
}
