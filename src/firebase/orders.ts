
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
} from 'firebase/firestore';
import { getClientSdks, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import type { CartItemWithProduct } from './cart';
import type { Product } from '@/lib/data/products';
import type { User as AuthUser } from 'firebase/auth';

export type OrderStatus = 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Atrasado';

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

  // --- CORREÇÃO: Operações de leitura realizadas ANTES da transação ---
  // 1. Obter os dados do usuário.
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
     // Emite um erro se o documento do usuário não for encontrado.
     errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({ path: userRef.path, operation: 'get' })
      );
    throw new Error("User document not found!");
  }
  const userData = userSnap.data() as User;

  // 2. Obter as referências de todos os itens do carrinho que serão deletados.
  const cartItemsCollectionRef = collection(
    firestore,
    `users/${userId}/shoppingCarts/${cartId}/cartItems`
  );
  const cartItemsSnapshot = await getDocs(query(cartItemsCollectionRef));
  const cartItemRefsToDelete = cartItemsSnapshot.docs.map(doc => doc.ref);


  // --- Transação apenas com operações de ESCRITA ---
  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Criar o novo documento de pedido.
      const newOrderRef = doc(collection(firestore, `users/${userId}/orders`));

      const orderItems = cartItems.map((cartItem) => ({
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        itemPrice: cartItem.product.price,
        product: {
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
        userEmail: userData.email || 'N/A',
        userPhone: userData.phone,
        userAddress: userData.address,
        userNeighborhood: userData.neighborhood,
        userCity: userData.city,
        orderDate: serverTimestamp(),
        paymentMethod,
        totalAmount,
        status: 'Pendente' as const,
        items: orderItems,
      };

      transaction.set(newOrderRef, newOrderData);

      // 2. Deletar todos os itens do carrinho usando as referências obtidas anteriormente.
      cartItemRefsToDelete.forEach(ref => transaction.delete(ref));
    });
  } catch (error) {
    // Se a transação falhar, agora o erro será mais provável de ser uma permissão real de escrita.
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `users/${userId}/orders`, // O caminho principal da operação de escrita
        operation: 'write',
        requestResourceData: { paymentMethod, totalAmount },
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

  const { data: ordersData, isLoading, error } = useCollection<OrderWithItems>(ordersQuery);

  // Add setOrders to allow local state updates
  const [orders, setOrders] = useState<OrderWithItems[]>([]);

  useEffect(() => {
    if (ordersData) {
        const sorted = [...ordersData].sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
        setOrders(sorted);
    }
  }, [ordersData]);


  return { orders, isLoading, error, setOrders };
}
