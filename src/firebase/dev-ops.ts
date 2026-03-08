'use client';

import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Firestore,
  WriteBatch,
  DocumentReference,
} from 'firebase/firestore';
import { getClientSdks } from '@/firebase';

export async function deleteAllData() {
  const { firestore } = getClientSdks();

  const commitBatches = async (batches: WriteBatch[]) => {
    for (const batch of batches) {
      await batch.commit();
    }
  };

  try {
    let batches: WriteBatch[] = [writeBatch(firestore)];
    let currentBatchIndex = 0;
    let operationsCount = 0;

    const addDeleteToBatch = (docRef: DocumentReference) => {
      if (operationsCount >= 499) {
        batches.push(writeBatch(firestore));
        currentBatchIndex++;
        operationsCount = 0;
      }
      batches[currentBatchIndex].delete(docRef);
      operationsCount++;
    };

    // 1. Get all users and their subcollections
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    for (const userDoc of usersSnapshot.docs) {
      // Delete shoppingCarts subcollection and its items
      const shoppingCartsRef = collection(userDoc.ref, 'shoppingCarts');
      const shoppingCartsSnap = await getDocs(shoppingCartsRef);
      for (const cartDoc of shoppingCartsSnap.docs) {
        const cartItemsRef = collection(cartDoc.ref, 'cartItems');
        const cartItemsSnap = await getDocs(cartItemsRef);
        cartItemsSnap.forEach((itemDoc) => addDeleteToBatch(itemDoc.ref));
        addDeleteToBatch(cartDoc.ref);
      }

      // Delete orders subcollection
      const ordersRef = collection(userDoc.ref, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      ordersSnap.forEach((orderDoc) => addDeleteToBatch(orderDoc.ref));

      // Finally, delete the user document itself
      addDeleteToBatch(userDoc.ref);
    }

    // 2. Get and delete all other top-level collections
    const topLevelCollections = ['productGroups', 'products', 'carouselImages'];
    for (const collectionName of topLevelCollections) {
      const collectionRef = collection(firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      snapshot.forEach((docToDelete) => addDeleteToBatch(docToDelete.ref));
    }

    // 3. Commit all batches
    await commitBatches(batches);
    
  } catch (e) {
    console.error('An error occurred while deleting all data:', e);
    // Re-throw so the caller can handle it, e.g., show a toast.
    throw e;
  }
  // Note: This does not delete users from Firebase Auth.
}
