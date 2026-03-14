'use server';
/**
 * @fileOverview Calculates shipping cost based on the real travel distance using Google Maps.
 * - calculateShipping - a function that calculates shipping fee.
 * - ShippingInput - The input type for the calculateShipping function.
 * - ShippingOutput - The return type for the calculateShipping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const ShippingInputSchema = z.object({
  address: z.string().describe("The client's full address for delivery."),
});
export type ShippingInput = z.infer<typeof ShippingInputSchema>;

const ShippingOutputSchema = z.object({
  distance: z.number().optional().describe('The distance in kilometers.'),
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
    const { address: clientAddress } = input;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const storeAddress = process.env.STORE_ADDRESS;

    if (!apiKey || !storeAddress) {
      console.error('Google Maps API key or Store Address is not configured in .env.local. Please check the file and ensure GOOGLE_MAPS_API_KEY and STORE_ADDRESS are set.');
      return { error: 'Serviço de entrega indisponível.' };
    }
    
    if (!clientAddress) {
      return { error: 'Endereço do cliente inválido.' };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(storeAddress)}&destinations=${encodeURIComponent(clientAddress)}&key=${apiKey}`;
      const response = await axios.get(url);

      const result = response.data.rows[0]?.elements[0];

      if (result?.status === 'OK') {
        const distanceInMeters = result.distance.value;
        const distanceInKm = distanceInMeters / 1000;
        const fee = distanceInKm * 2;
        
        return { distance: distanceInKm, fee };
      } else {
        const status = result?.status || response.data.status;
        console.error('Google Maps API Error:', status, response.data.error_message);
        if (status === 'ZERO_RESULTS' || status === 'NOT_FOUND') {
            return { error: 'Não foi possível encontrar o endereço.' };
        }
        return { error: 'Não foi possível calcular o frete para este endereço.' };
      }
    } catch (error) {
      console.error('Error calling Google Maps API:', error);
      return { error: 'Serviço de mapas indisponível.' };
    }
  }
);

export async function calculateShipping(input: ShippingInput): Promise<ShippingOutput> {
    return calculateShippingFlow(input);
}
