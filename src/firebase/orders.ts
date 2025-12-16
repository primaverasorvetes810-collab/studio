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
  paymentMethod: string
) {
  const { firestore } = getClientSdks();
  const userId = user.uid;

  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    let userData: Partial<User> = {};
    if (userSnap.exists()) {
        userData = userSnap.data() as User;
    }

    // --- Validação de Preços no Servidor ---
    let validatedTotalAmount = 0;
    const validatedOrderItems = [];

    for (const cartItem of cartItems) {
      const productRef = doc(firestore, 'products', cartItem.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error(`Produto com ID ${cartItem.productId} não encontrado.`);
      }

      const serverProduct = productSnap.data() as Product;
      const itemPrice = serverProduct.price; // Usar o preço do servidor
      validatedTotalAmount += itemPrice * cartItem.quantity;
      
      validatedOrderItems.push({
        id: cartItem.id, // cartItemId
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        itemPrice: itemPrice, // Preço validado
        product: { ...serverProduct, id: cartItem.productId }
      });
    }
    // --- Fim da Validação de Preços ---

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
      totalAmount: validatedTotalAmount, // Usar o total validado
      status: 'Pendente' as const,
      items: validatedOrderItems,
    };

    const newOrderRef = await addDoc(collection(firestore, `users/${userId}/orders`), newOrderData);

    const batch = writeBatch(firestore);

    for (const item of cartItems) {
      const productRef = doc(firestore, 'products', item.productId);
      batch.update(productRef, { 
        stock: increment(-item.quantity)
      });
    }

    for (const item of cartItems) {
        const cartItemRef = doc(firestore, `users/${userId}/shoppingCarts/${cartId}/cartItems`, item.id);
        batch.delete(cartItemRef);
    }
    
    await batch.commit();

  } catch (error: any) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `users/${userId}/orders`,
        operation: 'write',
        requestResourceData: {
          error: `Falha na transação de criação de pedido: ${error.message}`,
        },
      })
    );
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


  const [orders, setLocalOrders] = useState<OrderWithItems[]>([]);

  useEffect(() => {
    if (ordersData) {
        const sorted = [...ordersData].sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
        setLocalOrders(sorted);
    }
  }, [ordersData]);

  const handleSetOrders = (newOrders: OrderWithItems[] | ((prev: OrderWithItems[]) => OrderWithItems[])) => {
    if(typeof newOrders === 'function') {
      setLocalOrders(newOrders);
    } else {
      setLocalOrders(newOrders);
    }
  }


  return { orders, isLoading, error, setOrders: handleSetOrders };
}
