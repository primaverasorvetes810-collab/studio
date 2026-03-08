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

      // Delete orders subcollection under users
      const userOrdersRef = collection(userDoc.ref, 'orders');
      const userOrdersSnap = await getDocs(userOrdersRef);
      userOrdersSnap.forEach((orderDoc) => addDeleteToBatch(orderDoc.ref));

      // Finally, delete the user document itself
      addDeleteToBatch(userDoc.ref);
    }

    // 2. Handle top-level 'orders' collection and its subcollections (based on backend.json)
    const topLevelOrdersRef = collection(firestore, 'orders');
    const topLevelOrdersSnap = await getDocs(topLevelOrdersRef);
    for (const orderDoc of topLevelOrdersSnap.docs) {
      // Delete 'orderItems' subcollection
      const orderItemsRef = collection(orderDoc.ref, 'orderItems');
      const orderItemsSnap = await getDocs(orderItemsRef);
      orderItemsSnap.forEach((itemDoc) => addDeleteToBatch(itemDoc.ref));

      // Delete 'payments' subcollection
      const paymentsRef = collection(orderDoc.ref, 'payments');
      const paymentsSnap = await getDocs(paymentsRef);
      paymentsSnap.forEach((paymentDoc) => addDeleteToBatch(paymentDoc.ref));
      
      // Delete the order document itself
      addDeleteToBatch(orderDoc.ref);
    }

    // 3. Get and delete all other top-level collections
    const otherTopLevelCollections = ['productGroups', 'products', 'carouselImages'];
    for (const collectionName of otherTopLevelCollections) {
      const collectionRef = collection(firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      snapshot.forEach((docToDelete) => addDeleteToBatch(docToDelete.ref));
    }

    // 4. Commit all batches
    await commitBatches(batches);
    
  } catch (e) {
    console.error('An error occurred while deleting all data:', e);
    // Re-throw so the caller can handle it, e.g., show a toast.
    throw e;
  }
}
