'use server';
/**
 * @fileOverview Calculates shipping cost based on distance using Google Maps API.
 * - calculateShipping - A function that calculates shipping fee.
 * - ShippingInput - The input type for the calculateShipping function.
 * - ShippingOutput - The return type for the calculateShipping function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const ShippingInputSchema = z.object({
  clientAddress: z.string().describe('The full address of the client for delivery.'),
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
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
        console.error("Google Maps API key is not set in .env.local");
        return { error: 'A configuração da API de mapas está incompleta.' };
    }

    const originAddress = process.env.STORE_ADDRESS;
    if (!originAddress) {
        console.error("Store address is not set in .env.local");
        return { error: 'O endereço da loja não está configurado.' };
    }

    const { clientAddress } = input;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originAddress)}&destinations=${encodeURIComponent(clientAddress)}&key=${API_KEY}&language=pt-BR&units=metric`;

    try {
      const response = await axios.get(url);
      
      if (response.data.status !== 'OK' || response.data.rows[0].elements[0].status !== 'OK') {
          const status = response.data.rows[0]?.elements[0]?.status;
          console.error('Google Maps API Error:', status || response.data.error_message);
          
          if (status === 'NOT_FOUND' || status === 'ZERO_RESULTS') {
            return { error: 'Não foi possível encontrar o endereço de destino.' };
          }
          return { error: 'Não foi possível calcular a distância.' };
      }

      const distanceInMeters = response.data.rows[0].elements[0].distance.value;
      const distanceInKm = distanceInMeters / 1000;

      // Tiered pricing logic as suggested
      let fee: number | null = null;
      if (distanceInKm <= 2) fee = 5.00;
      else if (distanceInKm <= 5) fee = 8.00;
      else if (distanceInKm <= 8) fee = 12.00;

      if (fee === null) {
          return { distance: distanceInKm, error: `Fora da nossa área de entrega (${distanceInKm.toFixed(1)} km).` };
      }

      return { distance: distanceInKm, fee };

    } catch (error: any) {
      console.error("Error calculating shipping:", error.message);
      return { error: 'Ocorreu um erro ao calcular o frete.' };
    }
  }
);

export async function calculateShipping(input: ShippingInput): Promise<ShippingOutput> {
    return calculateShippingFlow(input);
}
