'use client';

import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
} from 'firebase/firestore';
import { getClientSdks } from '@/firebase';
import { z } from 'zod';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


export const CarouselImageSchema = z.object({
    id: z.string(),
    imageUrl: z.string().url(),
    altText: z.string(),
    link: z.string().url().optional(),
    order: z.number(),
});

export type CarouselImage = z.infer<typeof CarouselImageSchema>;

export const CarouselImagePayloadSchema = CarouselImageSchema.omit({ id: true });
export type CarouselImagePayload = z.infer<typeof CarouselImagePayloadSchema>;


export async function createCarouselImage(payload: CarouselImagePayload) {
  const { firestore } = getClientSdks();
  const carouselCollection = collection(firestore, 'carouselImages');
  const validatedPayload = CarouselImagePayloadSchema.parse(payload);
  try {
    return await addDoc(carouselCollection, validatedPayload);
  } catch (e: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: 'carouselImages',
        operation: 'create',
        requestResourceData: validatedPayload,
      })
    );
    throw e;
  }
}

export async function updateCarouselImage(imageId: string, payload: Partial<CarouselImagePayload>) {
  const { firestore } = getClientSdks();
  const imageDoc = doc(firestore, 'carouselImages', imageId);
  try {
    return await updateDoc(imageDoc, payload);
  } catch (e: any) {
     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: imageDoc.path,
        operation: 'update',
        requestResourceData: payload,
      })
    );
    throw e;
  }
}

export async function deleteCarouselImage(imageId: string) {
  const { firestore } = getClientSdks();
  const imageDoc = doc(firestore, 'carouselImages', imageId);
  try {
    return await deleteDoc(imageDoc);
  } catch (e: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: imageDoc.path,
        operation: 'delete',
      })
    );
    throw e;
  }
}

export async function updateCarouselImageOrder(updates: { id: string; order: number }[]) {
    const { firestore } = getClientSdks();
    const batch = writeBatch(firestore);

    updates.forEach(update => {
        const docRef = doc(firestore, 'carouselImages', update.id);
        batch.update(docRef, { order: update.order });
    });

    try {
        await batch.commit();
    } catch(e: any) {
         errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'carouselImages',
            operation: 'write', // Batch write is a write operation
          })
        );
        throw e;
    }
}
