'use client';

import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getClientSdks } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from './non-blocking-updates';
import { z } from 'zod';

const GroupPayloadSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

type GroupPayload = z.infer<typeof GroupPayloadSchema>;

export function createProductGroup(payload: GroupPayload) {
  const { firestore } = getClientSdks();
  const groupsCollection = collection(firestore, 'productGroups');
  const validatedPayload = GroupPayloadSchema.parse(payload);
  return addDocumentNonBlocking(groupsCollection, validatedPayload);
}

export function updateProductGroup(groupId: string, payload: Partial<GroupPayload>) {
  const { firestore } = getClientSdks();
  const groupDoc = doc(firestore, 'productGroups', groupId);
  return updateDocumentNonBlocking(groupDoc, payload);
}

// Deletes a group and all products within it.
export function deleteProductGroup(groupId: string) {
    const { firestore } = getClientSdks();
    const groupDocRef = doc(firestore, 'productGroups', groupId);

    // This is an async operation that runs in the background.
    // We don't use the non-blocking variants here because it's a transaction.
    const deleteGroupAndProducts = async () => {
        try {
            const batch = writeBatch(firestore);

            // 1. Find all products in the group
            const productsRef = collection(firestore, 'products');
            const q = query(productsRef, where('groupId', '==', groupId));
            const productsSnapshot = await getDocs(q);

            // 2. Delete all found products
            productsSnapshot.forEach(productDoc => {
                batch.delete(productDoc.ref);
            });

            // 3. Delete the group itself
            batch.delete(groupDocRef);

            // 4. Commit the batch
            await batch.commit();

        } catch (error) {
            // This error is critical, but we don't have a global handler for batch writes.
            // Logging to console is the fallback.
            console.error("Failed to delete product group and its products:", error);
        }
    };

    deleteGroupAndProducts();
}
