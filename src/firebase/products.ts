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
    name: z.string(),
    description: z.string(),
    price: z.number(),
    image: z.string(),
    stock: z.number(),
    groupId: z.string(),
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
