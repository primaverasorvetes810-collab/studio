'use server';
/**
 * @fileOverview Calculates shipping cost based on predefined delivery zones by neighborhood.
 * - calculateShipping - a function that calculates shipping fee.
 * - ShippingInput - The input type for the calculateShipping function.
 * - ShippingOutput - The return type for the calculateShipping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ShippingInputSchema = z.object({
  neighborhood: z.string().describe("The client's neighborhood for delivery."),
});
export type ShippingInput = z.infer<typeof ShippingInputSchema>;

const ShippingOutputSchema = z.object({
  distance: z.number().optional().describe('The distance in kilometers (no longer used).'),
  fee: z.number().optional().describe('The calculated shipping fee.'),
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
    // Define your delivery zones and fees here by neighborhood.
    // The keys are the fee in string format (e.g., "5.00") and the values are arrays of neighborhood names in lowercase.
    const deliveryZones = {
        '5.00': ['centro', 'jardim paulista', 'vila progresso', 'jardim faculdade'],
        '8.00': ['parque campolim', 'jardim américa', 'jardim santa rosalia', 'além ponte'],
        '12.00': ['jardim simus', 'wanel ville', 'parque são bento', 'cajuru do sul'],
    };

    const { neighborhood } = input;
    
    // Normalize the client's neighborhood for comparison
    const clientNeighborhood = neighborhood.trim().toLowerCase();
    
    if (!clientNeighborhood) {
        return { error: 'Bairro inválido.' };
    }

    // Find the fee for the client's neighborhood
    let foundFee: number | null = null;
    for (const fee in deliveryZones) {
        const neighborhoods = deliveryZones[fee as keyof typeof deliveryZones];
        if (neighborhoods.includes(clientNeighborhood)) {
            foundFee = parseFloat(fee);
            break;
        }
    }

    if (foundFee !== null) {
        return { fee: foundFee };
    } else {
        return { error: 'Fora da nossa área de entrega.' };
    }
  }
);

export async function calculateShipping(input: ShippingInput): Promise<ShippingOutput> {
    return calculateShippingFlow(input);
}
