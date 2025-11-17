'use client';

import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
} from 'firebase/firestore';
import { getClientSdks } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from './non-blocking-updates';
import type { Product } from '@/lib/data/products';
import { z } from 'zod';

// Zod schema for creating/updating a product, including groupId
export const ProductPayloadSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    description: z.string().min(1, 'A descrição é obrigatória.'),
    price: z.number().min(0.01, 'O preço deve ser maior que zero.'),
    image: z.string().min(1, 'A imagem é obrigatória.'),
    stock: z.number().min(0, 'O estoque não pode ser negativo.'),
    groupId: z.string().min(1, 'O grupo é obrigatório.'),
});

export type ProductPayload = z.infer<typeof ProductPayloadSchema>;


export function createProduct(payload: ProductPayload) {
  const { firestore } = getClientSdks();
  const productsCollection = collection(firestore, 'products');
  // Validate payload before sending to Firestore
  const validatedPayload = ProductPayloadSchema.parse(payload);
  return addDocumentNonBlocking(productsCollection, validatedPayload);
}

export function updateProduct(productId: string, payload: Partial<ProductPayload>) {
  const { firestore } = getClientSdks();
  const productDoc = doc(firestore, 'products', productId);
  // Do not parse partial payload, as it's for updates
  return updateDocumentNonBlocking(productDoc, payload);
}

export function deleteProduct(productId: string) {
  const { firestore } = getClientSdks();
  const productDoc = doc(firestore, 'products', productId);
  return deleteDocumentNonBlocking(productDoc);
}
