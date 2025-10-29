"use client";

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  runTransaction,
  serverTimestamp,
  getDoc,
  writeBatch,
  increment
} from "firebase/firestore";
import { getSdks } from "@/firebase";
import { errorEmitter } from "./error-emitter";
import { FirestorePermissionError } from "./errors";

const { firestore } = getSdks();

// Helper function to find a user's shopping cart
async function findUserShoppingCart(userId: string) {
  const cartsCollection = collection(firestore, `users/${userId}/shoppingCarts`);
  const q = query(cartsCollection, limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].ref;
  }
  return null;
}

// Helper function to create a new shopping cart for a user
async function createUserShoppingCart(userId: string) {
  const cartsCollection = collection(firestore, `users/${userId}/shoppingCarts`);
  const newCartRef = doc(cartsCollection); // Creates a new doc with a generated ID
  const newCartData = {
    userId: userId,
    createdAt: serverTimestamp(),
  };

  const promise = setDocumentNonBlocking(newCartRef, newCartData, {});
  
  return newCartRef;
}

// Main function to add a product to the cart
export function addProductToCart(userId: string, productId: string, quantity: number = 1) {
    runTransaction(firestore, async (transaction) => {
        let cartRef = await findUserShoppingCart(userId);

        if (!cartRef) {
            // No cart exists, create one
            const newCartRef = doc(collection(firestore, `users/${userId}/shoppingCarts`));
            transaction.set(newCartRef, { userId: userId, createdAt: serverTimestamp() });
            cartRef = newCartRef;
        }

        const cartItemsCollection = collection(cartRef, "cartItems");
        const productQuery = query(cartItemsCollection, where("productId", "==", productId), limit(1));
        const productSnapshot = await getDocs(productQuery);

        if (productSnapshot.empty) {
            // Product not in cart, add it
            const newCartItemRef = doc(cartItemsCollection);
            transaction.set(newCartItemRef, {
                productId: productId,
                quantity: quantity,
                addedAt: serverTimestamp(),
            });
        } else {
            // Product is in cart, update quantity
            const existingItemRef = productSnapshot.docs[0].ref;
            transaction.update(existingItemRef, {
                quantity: increment(quantity),
            });
        }
    }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `users/${userId}/shoppingCarts`,
            operation: 'write', 
            requestResourceData: { productId, quantity },
          })
        )
      });
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
function setDocumentNonBlocking(docRef: any, data: any, options: any) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
  })
}
