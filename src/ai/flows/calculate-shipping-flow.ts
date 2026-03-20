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
    
    // Since the neighborhood is selected from a controlled list, a direct,
    // case-sensitive comparison is safer and avoids normalization issues.
    // We use .trim() as a simple precaution.
    const trimmedNeighborhood = input.neighborhood.trim();
    const isAllowed = allowedNeighborhoods.includes(trimmedNeighborhood);
    
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
