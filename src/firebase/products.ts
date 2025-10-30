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

export type ProductPayload = Omit<Product, 'id'>;

export function createProduct(payload: ProductPayload) {
  const { firestore } = getClientSdks();
  const productsCollection = collection(firestore, 'products');
  return addDocumentNonBlocking(productsCollection, payload);
}

export function updateProduct(productId: string, payload: Partial<ProductPayload>) {
  const { firestore } = getClientSdks();
  const productDoc = doc(firestore, 'products', productId);
  return updateDocumentNonBlocking(productDoc, payload);
}

export function deleteProduct(productId: string) {
  const { firestore } = getClientSdks();
  const productDoc = doc(firestore, 'products', productId);
  return deleteDocumentNonBlocking(productDoc);
}
