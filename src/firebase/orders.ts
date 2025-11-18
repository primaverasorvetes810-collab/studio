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
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { getClientSdks, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import type { CartItemWithProduct } from './cart';
import type { Product } from '@/lib/data/products';
import type { User as AuthUser } from 'firebase/auth';

export type OrderStatus = 'Pendente' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Atrasado';

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

export interface User {
    id: string;
    email: string;
    registerTime: Timestamp;
    fullName: string;
    birthDate: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userPhone?: string;
  userAddress?: string;
  userNeighborhood?: string;
  userCity?: string;
  orderDate: Timestamp;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItemWithProduct[];
}

export interface OrderWithItems extends Order {}

export async function createOrderFromCart(
  user: AuthUser,
  cartId: string,
  cartItems: CartItemWithProduct[],
  paymentMethod: string,
  totalAmount: number
) {
  const { firestore } = getClientSdks();
  const userId = user.uid;

  try {
    // 1. Get user data from auth, not from a separate doc
    // This is more robust as the auth user object is always available if they are logged in.
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    let userData: Partial<User> = {};
    if (userSnap.exists()) {
        userData = userSnap.data() as User;
    }


    // 2. Prepare the order data
    const orderItems = cartItems.map((cartItem) => ({
      id: cartItem.id, // This is cartItemId
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      itemPrice: cartItem.product.price,
      product: { // Denormalize product data
        id: cartItem.product.id,
        name: cartItem.product.name,
        description: cartItem.product.description,
        price: cartItem.product.price,
        image: cartItem.product.image,
        stock: cartItem.product.stock,
        groupId: cartItem.product.groupId
      }
    }));
    
    const newOrderData = {
      userId,
      userName: userData.fullName || user.displayName || 'N/A',
      userEmail: user.email || 'N/A',
      userPhone: userData.phone || '',
      userAddress: userData.address || '',
      userNeighborhood: userData.neighborhood || '',
      userCity: userData.city || '',
      orderDate: serverTimestamp(),
      paymentMethod,
      totalAmount,
      status: 'Pendente' as const,
      items: orderItems,
    };

    // 3. Create the order
    const newOrderRef = await addDoc(collection(firestore, `users/${userId}/orders`), newOrderData);

    // 4. Use a batch write for atomic stock updates and cart deletion
    const batch = writeBatch(firestore);

    // Update stock for each product
    for (const item of cartItems) {
      const productRef = doc(firestore, 'products', item.productId);
      batch.update(productRef, { 
        stock: increment(-item.quantity)
      });
    }

    // Delete all items from the user's cart
    for (const item of cartItems) {
        const cartItemRef = doc(firestore, `users/${userId}/shoppingCarts/${cartId}/cartItems`, item.id);
        batch.delete(cartItemRef);
    }
    
    // 5. Commit the batch
    await batch.commit();

  } catch (error: any) {
    // If any operation fails, emit a generic but informative error
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `users/${userId}/orders`, // A representative path
        operation: 'write',
        requestResourceData: {
          error: `Falha na transação de criação de pedido: ${error.message}`,
        },
      })
    );
     // Re-throw the original error after emitting our custom one
     throw error;
  }
}

export async function updateOrderStatus(userId: string, orderId: string, status: OrderStatus) {
  const { firestore } = getClientSdks();
  const orderRef = doc(firestore, `users/${userId}/orders`, orderId);
  try {
    await updateDoc(orderRef, { status });
  } catch (e: any) {
     errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: orderRef.path,
        operation: 'update',
        requestResourceData: { status },
      })
    );
    throw e;
  }
}

export function useUserOrders(userId?: string) {
  const { firestore } = getClientSdks();

  const ordersQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(collection(firestore, `users/${userId}/orders`));
  }, [userId, firestore]);

  const { data: ordersData, isLoading, error, setData: setOrders } = useCollection<OrderWithItems>(ordersQuery);


  // Add setOrders to allow local state updates
  const [orders, setLocalOrders] = useState<OrderWithItems[]>([]);

  useEffect(() => {
    if (ordersData) {
        const sorted = [...ordersData].sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
        setLocalOrders(sorted);
    }
  }, [ordersData]);

  // Expose a setter that wraps the local state update
  const handleSetOrders = (newOrders: OrderWithItems[] | ((prev: OrderWithItems[]) => OrderWithItems[])) => {
    if(typeof newOrders === 'function') {
      setLocalOrders(newOrders);
    } else {
      setLocalOrders(newOrders);
    }
  }


  return { orders, isLoading, error, setOrders: handleSetOrders };
}
