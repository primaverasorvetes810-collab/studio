'use client';

import {
  collection,
  doc,
  getDocs,
  query,
  limit,
  runTransaction,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { getSdks, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import {
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from './non-blocking-updates';
import { useEffect, useState, useMemo } from 'react';
import type { Product } from '@/lib/data/products';
import { products as staticProducts } from '@/lib/data/products';

// Helper to find a user's shopping cart. Assumes one cart per user.
async function findUserShoppingCartRef(userId: string) {
  const { firestore } = getSdks();
  const cartsCollection = collection(firestore, `users/${userId}/shoppingCarts`);
  const q = query(cartsCollection, limit(1));
  try {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].ref;
    }
  } catch (e: any) {
     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `users/${userId}/shoppingCarts`,
        operation: 'list',
      })
    );
  }
  return null;
}

// Add product to cart using a transaction
export function addProductToCart(
  userId: string,
  productId: string,
  quantity: number = 1
) {
  const { firestore } = getSdks();
  runTransaction(firestore, async (transaction) => {
    let cartRef = await findUserShoppingCartRef(userId);

    // If no cart exists, create one within the transaction
    if (!cartRef) {
      const newCartRef = doc(
        collection(firestore, `users/${userId}/shoppingCarts`)
      );
      transaction.set(newCartRef, { userId, createdAt: serverTimestamp() });
      cartRef = newCartRef;
    }

    const cartItemsCollection = collection(cartRef, 'cartItems');
    const newCartItemRef = doc(cartItemsCollection); // Let Firestore generate ID

    // In a real app, you might query if the item already exists.
    // For simplicity, we add a new item each time, which is fine if cart displays aggregate.
    // A more robust solution would check for existing `productId` and update quantity.
    transaction.set(newCartItemRef, {
      productId: productId,
      quantity: quantity,
      addedAt: serverTimestamp(),
    });
  }).catch((error) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `users/${userId}/shoppingCarts`,
        operation: 'write',
        requestResourceData: { productId, quantity },
      })
    );
  });
}

// Remove a product from the cart
export function removeProductFromCart(
  userId: string,
  cartId: string,
  cartItemId: string
) {
  const { firestore } = getSdks();
  const itemRef = doc(
    firestore,
    `users/${userId}/shoppingCarts/${cartId}/cartItems`,
    cartItemId
  );
  deleteDocumentNonBlocking(itemRef);
}

// Update the quantity of a product in the cart
export function updateCartItemQuantity(
  userId: string,
  cartId: string,
  cartItemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    // If quantity is zero or less, remove the item
    removeProductFromCart(userId, cartId, cartItemId);
  } else {
    const { firestore } = getSdks();
    const itemRef = doc(
      firestore,
      `users/${userId}/shoppingCarts/${cartId}/cartItems`,
      cartItemId
    );
    updateDocumentNonBlocking(itemRef, { quantity });
  }
}

// --- Hooks for Cart Data ---

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export function useCart(userId?: string) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartIdLoading, setIsCartIdLoading] = useState(true);
  const { firestore } = getSdks();

  // Effect to find the user's cart ID
  useEffect(() => {
    if (!userId) {
      setIsCartIdLoading(false);
      setCartId(null);
      return;
    }

    setIsCartIdLoading(true);
    findUserShoppingCartRef(userId).then((ref) => {
      setCartId(ref ? ref.id : null);
      setIsCartIdLoading(false);
    });
  }, [userId]);

  // Memoize the query to the cartItems subcollection
  const cartItemsQuery = useMemoFirebase(() => {
    if (!userId || !cartId) return null;
    return collection(
      firestore,
      `users/${userId}/shoppingCarts/${cartId}/cartItems`
    );
  }, [userId, cartId, firestore]);

  // Use the useCollection hook to get cart items
  const {
    data: cartItemsData,
    isLoading: isCartItemsLoading,
    error,
  } = useCollection<CartItem>(cartItemsQuery);

  const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: areProductsLoading } = useCollection<Product>(productsCollection);


  // Combine cart item data with full product details
  const cartItemsWithProducts = useMemo((): CartItemWithProduct[] => {
    if (!cartItemsData || !products) return [];

    return cartItemsData
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        // If product not found, filter it out
        return product ? { ...item, product } : null;
      })
      .filter((item): item is CartItemWithProduct => item !== null);
  }, [cartItemsData, products]);

  return {
    cartId,
    cartItems: cartItemsWithProducts,
    isLoading: isCartIdLoading || isCartItemsLoading || areProductsLoading,
    error,
  };
}
