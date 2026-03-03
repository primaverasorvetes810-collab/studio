'use client';

import { collection, getDocs, writeBatch, doc, Firestore } from 'firebase/firestore';
import { getClientSdks } from '@/firebase';

async function commitBatchIfNeeded(
  firestore: Firestore,
  batch: any,
  operationsCount: number
): Promise<{ batch: any; operationsCount: number }> {
  if (operationsCount >= 490) { // Keep a small buffer
    await batch.commit();
    return { batch: writeBatch(firestore), operationsCount: 0 };
  }
  return { batch, operationsCount };
}

export async function deleteAllData() {
    const { firestore } = getClientSdks();
    let batch = writeBatch(firestore);
    let operationsCount = 0;

    // 1. Delete all top-level collections that are not 'users'
    const collectionsToDelete = ['productGroups', 'products', 'carouselImages'];
    for (const collectionName of collectionsToDelete) {
        try {
            const collectionRef = collection(firestore, collectionName);
            const snapshot = await getDocs(collectionRef);
            if(snapshot.empty) continue;

            for (const docSnapshot of snapshot.docs) {
                batch.delete(docSnapshot.ref);
                operationsCount++;
                ({ batch, operationsCount } = await commitBatchIfNeeded(firestore, batch, operationsCount));
            }
        } catch (e) {
            console.error(`Error deleting collection ${collectionName}:`, e);
        }
    }
    // Commit any remaining deletions from top-level collections
    if (operationsCount > 0) {
        await batch.commit();
        batch = writeBatch(firestore);
        operationsCount = 0;
    }


    // 2. Handle users and their subcollections
    try {
        const usersSnapshot = await getDocs(collection(firestore, 'users'));

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;

            // Delete shoppingCarts and cartItems
            const shoppingCartsSnapshot = await getDocs(collection(firestore, `users/${userId}/shoppingCarts`));
            for (const cartDoc of shoppingCartsSnapshot.docs) {
                const cartItemsSnapshot = await getDocs(collection(cartDoc.ref, 'cartItems'));
                for(const itemDoc of cartItemsSnapshot.docs) {
                    batch.delete(itemDoc.ref);
                    operationsCount++;
                    ({ batch, operationsCount } = await commitBatchIfNeeded(firestore, batch, operationsCount));
                }
                batch.delete(cartDoc.ref);
                operationsCount++;
                ({ batch, operationsCount } = await commitBatchIfNeeded(firestore, batch, operationsCount));
            }

            // Delete orders
            const ordersSnapshot = await getDocs(collection(userDoc.ref, 'orders'));
            for(const orderDoc of ordersSnapshot.docs) {
                batch.delete(orderDoc.ref);
                operationsCount++;
                ({ batch, operationsCount } = await commitBatchIfNeeded(firestore, batch, operationsCount));
            }
            
            // Delete the user document itself
            batch.delete(userDoc.ref);
            operationsCount++;
            ({ batch, operationsCount } = await commitBatchIfNeeded(firestore, batch, operationsCount));
        }
    } catch(e) {
        console.error('Error deleting users and subcollections:', e);
    }
    
    // Commit the final batch
    if (operationsCount > 0) {
        await batch.commit();
    }
    
    // Note: This does not delete users from Firebase Auth.
}
