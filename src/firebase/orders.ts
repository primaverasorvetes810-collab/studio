'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  addDoc,
  doc,
  serverTimestamp,
  runTransaction,
  query,
  getDocs,
  where,
  Timestamp,
  collectionGroup,
  getDoc,
} from 'firebase/firestore';
import { getClientSdks, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import type { CartItemWithProduct } from './cart';
import type { Product } from '@/lib/data/products';
import { products as staticProducts } from '@/lib/data/products';
import type { User } from 'firebase/auth';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  itemPrice: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  orderDate: Timestamp;
  paymentMethod: string;
  totalAmount: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Atrasado';
  items: OrderItemWithProduct[];
}

export interface OrderWithItems extends Order {}

export async function createOrderFromCart(
  user: User,
  cartId: string,
  cartItems: CartItemWithProduct[],
  paymentMethod: string,
  totalAmount: number
) {
  const { firestore } = getClientSdks();
  const userId = user.uid;
  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Create a new order document with items included
      const ordersCollection = collection(firestore, `users/${userId}/orders`);
      const newOrderRef = doc(ordersCollection);

      // Prepare items to be embedded
      const orderItems = cartItems.map((cartItem) => ({
        id: cartItem.id, // Using cart item id, or generate a new one
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        itemPrice: cartItem.product.price,
        product: { // Embed product details
          id: cartItem.product.id,
          name: cartItem.product.name,
          description: cartItem.product.description,
          price: cartItem.product.price,
          image: cartItem.product.image,
          stock: cartItem.product.stock,
        }
      }));


      const newOrderData = {
        userId,
        userName: user.displayName,
        userEmail: user.email,
        orderDate: serverTimestamp(),
        paymentMethod,
        totalAmount,
        status: 'Pendente',
        items: orderItems,
      };
      
      transaction.set(newOrderRef, newOrderData);

      // 2. Delete all items from the user's cart
      const cartItemsCollectionRef = collection(
        firestore,
        `users/${userId}/shoppingCarts/${cartId}/cartItems`
      );
      const cartItemsSnapshot = await getDocs(query(cartItemsCollectionRef));
      for (const cartDoc of cartItemsSnapshot.docs) {
        transaction.delete(cartDoc.ref);
      }
    });
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `users/${userId}/orders`,
        operation: 'write',
        requestResourceData: { paymentMethod, totalAmount },
      })
    );
    // Re-throw the original error if it's not a permission error or for other logging
    throw error;
  }
}

export function useUserOrders(userId?: string) {
  const { firestore } = getClientSdks();

  const ordersQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, `users/${userId}/orders`));
  }, [userId, firestore]);

  const { data: ordersData, isLoading, error } = useCollection<OrderWithItems>(ordersQuery);

  const sortedOrders = useMemo(() => {
     if (!ordersData) return [];
     return ordersData.sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
  }, [ordersData]);


  return { orders: sortedOrders, isLoading, error };
}

export function useAllOrders() {
    const { firestore } = getClientSdks();
  
    const ordersQuery = useMemoFirebase(() => {
      return collectionGroup(firestore, 'orders');
    }, [firestore]);
  
    const { data: ordersData, isLoading, error } = useCollection<Order>(ordersQuery as any);
  
    const sortedOrders = useMemo(() => {
      if (!ordersData) return [];
      // Ordena os pedidos por data, do mais recente para o mais antigo
      return [...ordersData].sort((a, b) => {
        const dateA = a.orderDate?.toDate()?.getTime() || 0;
        const dateB = b.orderDate?.toDate()?.getTime() || 0;
        return dateB - dateA;
      });
    }, [ordersData]);
  
    return { orders: sortedOrders, isLoading, error };
}
