'use server';
/**
 * @fileOverview Calculates shipping cost based on pre-defined delivery zones by neighborhood.
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
  fee: z.number().optional().describe('The calculated shipping fee.'),
  error: z.string().optional().describe('An error message if calculation fails.'),
});
export type ShippingOutput = z.infer<typeof ShippingOutputSchema>;

// Helper function to normalize strings for comparison (lowercase, no accents, trimmed)
const normalizeString = (str: string) => {
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD") // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
}

const calculateShippingFlow = ai.defineFlow(
  {
    name: 'calculateShippingFlow',
    inputSchema: ShippingInputSchema,
    outputSchema: ShippingOutputSchema,
  },
  async (input) => {
    const { neighborhood } = input;
    
    if (!neighborhood) {
      return { error: 'Bairro não informado.' };
    }

    // --- Zonas de Entrega e Taxas ---
    // Adicione ou remova bairros e ajuste os valores conforme necessário.
    // Os nomes dos bairros serão comparados sem distinção de maiúsculas/minúsculas ou acentos.
    const deliveryZones: Record<string, string[]> = {
      '5.00': ['centro', 'vila nova'],
      '8.00': ['jardim paulista', 'jardim europa'],
      '12.00': ['parque industrial', 'zona norte'],
    };

    const normalizedNeighborhood = normalizeString(neighborhood);

    for (const fee in deliveryZones) {
      const isZoneMatch = deliveryZones[fee].some(zoneNeighborhood => 
        normalizeString(zoneNeighborhood) === normalizedNeighborhood
      );
      
      if (isZoneMatch) {
        return { fee: parseFloat(fee) };
      }
    }

    // If no zone matches
    return { error: 'Fora da área de entrega.' };
  }
);

export async function calculateShipping(input: ShippingInput): Promise<ShippingOutput> {
    return calculateShippingFlow(input);
}
