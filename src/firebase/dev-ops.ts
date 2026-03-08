'use client';

import {
  collection,
  getDocs,
  writeBatch,
  doc,
  DocumentReference,
  collectionGroup,
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

    // Use collectionGroup para encontrar e deletar todos os documentos de sub-coleções primeiro.
    // Isso é robusto contra mudanças na estrutura de dados.
    const groupCollectionsToDelete = ['orders', 'cartItems', 'shoppingCarts', 'orderItems', 'payments'];
    for (const groupName of groupCollectionsToDelete) {
        const groupSnapshot = await getDocs(collectionGroup(firestore, groupName));
        groupSnapshot.forEach((docToDelete) => {
            addDeleteToBatch(docToDelete.ref);
        });
    }

    // Agora, delete todos os documentos das coleções de nível superior.
    const topLevelCollectionsToDelete = ['users', 'productGroups', 'products', 'carouselImages'];
    for (const collectionName of topLevelCollectionsToDelete) {
      const collectionRef = collection(firestore, collectionName);
      const snapshot = await getDocs(collectionRef);
      snapshot.forEach((docToDelete) => {
          addDeleteToBatch(docToDelete.ref)
      });
    }
    
    // Uma verificação extra para uma coleção 'orders' de nível superior, por segurança.
    const topLevelOrders = await getDocs(collection(firestore, 'orders'));
    topLevelOrders.forEach(docToDelete => addDeleteToBatch(docToDelete.ref));

    // Execute todos os lotes.
    await commitBatches(batches);
    
  } catch (e) {
    console.error('An error occurred while deleting all data:', e);
    // Relança o erro para que o chamador possa lidar com ele, ex: mostrar um toast.
    throw e;
  }
}
