'use client';

import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDoc,
} from 'firebase/firestore';
import { getClientSdks } from '@/firebase';
import { deleteDocumentNonBlocking } from './non-blocking-updates';
import type { Product } from '@/lib/data/products';
import { z } from 'zod';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import type { WithId } from './firestore/use-collection';

// Zod schema for creating/updating a product, including groupId
export const ProductPayloadSchema = z.object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    description: z.string().min(1, 'A descrição é obrigatória.'),
    price: z.number().min(0.01, 'O preço deve ser maior que zero.'),
    imageUrl: z.string().url().or(z.literal('')).optional(),
    stock: z.number().min(0, 'O estoque não pode ser negativo.'),
    groupId: z.string().min(1, 'O grupo é obrigatório.'),
    isActive: z.boolean().default(true),
    subgroup: z.string().optional(),
    manageStock: z.boolean().default(true),
});

export type ProductPayload = z.infer<typeof ProductPayloadSchema>;


export async function createProduct(payload: ProductPayload): Promise<WithId<Product>> {
  const { firestore } = getClientSdks();
  const productsCollection = collection(firestore, 'products');
  const validatedPayload = ProductPayloadSchema.parse(payload);
  try {
    const docRef = await addDoc(productsCollection, validatedPayload);
    const newDocSnap = await getDoc(docRef);
    if (!newDocSnap.exists()) {
        throw new Error("Falha ao criar o documento do produto.");
    }
    return { ...(newDocSnap.data() as Product), id: newDocSnap.id };
  } catch (e: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: productsCollection.path,
        operation: 'create',
        requestResourceData: validatedPayload,
      })
    );
    throw e;
  }
}

export async function updateProduct(productId: string, payload: Partial<ProductPayload>) {
  const { firestore } = getClientSdks();
  const productDoc = doc(firestore, 'products', productId);
  try {
    await updateDoc(productDoc, payload);
  } catch (e: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: productDoc.path,
        operation: 'update',
        requestResourceData: payload,
      })
    );
    throw e;
  }
}

export function deleteProduct(productId: string) {
  const { firestore } = getClientSdks();
  const productDoc = doc(firestore, 'products', productId);
  return deleteDocumentNonBlocking(productDoc);
}
