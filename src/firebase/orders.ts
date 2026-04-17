'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  onSnapshot,
  DocumentReference,
} from 'firebase/firestore';
import { getClientSdks, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import type { CartItemWithProduct } from './cart';
import type { Product } from '@/lib/data/products';
import type { User as AuthUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';


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
    photoURL?: string;
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
  statusUpdatedAt?: Timestamp;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItemWithProduct[];
}

export interface OrderWithItems extends Order {}

function sendVisualNotification(title: string, options: NotificationOptions) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}

export function useAllAdminOrders() {
    const { firestore } = getClientSdks();
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const previousOrdersRef = useRef<Order[]>([]);

    useEffect(() => {
        if (!firestore) {
          setIsLoading(false);
          return;
        };

        const ordersQuery = collectionGroup(firestore, 'orders');
        const q = query(ordersQuery);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let fetchedOrders: Order[] = [];
            snapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
            });

            const activeOrders = fetchedOrders.filter(
                (order) => order.status !== 'Cancelado'
            );
            const sortedOrders = activeOrders.sort(
                (a, b) => b.orderDate.toMillis() - a.orderDate.toMillis()
            );

            // New order detection for visual notification
            if (previousOrdersRef.current.length > 0) {
                const previousOrderIds = new Set(previousOrdersRef.current.map(o => o.id));
                const newOrders = sortedOrders.filter(
                    o => !previousOrderIds.has(o.id) && o.status === 'Pendente'
                );

                newOrders.forEach(order => {
                    sendVisualNotification('Novo Pedido Recebido!', {
                        body: `Cliente: ${order.userName}\nTotal: ${formatPrice(order.totalAmount)}`,
                        icon: '/icons/icon-192x192.png',
                    });
                });
            }
            
            setAllOrders(sortedOrders);
            previousOrdersRef.current = sortedOrders;
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching all orders:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar pedidos',
                description: 'Não foi possível buscar os pedidos. Verifique as permissões do Firestore.',
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, toast]);

    return { allOrders, isLoading };
}


export async function createOrderFromCart(
  user: AuthUser,
  cartId: string,
  cartItems: CartItemWithProduct[],
  paymentMethod: string,
  shippingFee: number
) {
  const { firestore } = getClientSdks();
  const userId = user.uid;

  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Fetch user data (outside transaction for non-critical display data)
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? (userSnap.data() as User) : {};

      let subtotal = 0;
      const validatedOrderItems = [];
      const productUpdates: { ref: DocumentReference; newStock: number }[] = [];

      // 2. Process each cart item within the transaction
      for (const cartItem of cartItems) {
        const productRef = doc(firestore, 'products', cartItem.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(
            `Produto "${cartItem.product.name}" não está mais disponível.`
          );
        }

        const serverProduct = productSnap.data() as Product;

        // 3. Check stock if it's managed
        if (serverProduct.manageStock) {
          if (serverProduct.stock < cartItem.quantity) {
            throw new Error(
              `Estoque insuficiente para "${serverProduct.name}". Temos apenas ${serverProduct.stock} unidade(s).`
            );
          }
          // Prepare stock update
          productUpdates.push({
            ref: productRef,
            newStock: serverProduct.stock - cartItem.quantity,
          });
        }

        const itemPrice = serverProduct.price;
        subtotal += itemPrice * cartItem.quantity;

        validatedOrderItems.push({
          id: cartItem.id, // cartItemId
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          itemPrice: itemPrice,
          product: { ...serverProduct, id: cartItem.productId },
        });
      }

      // All checks passed, proceed with writes

      // 4. Update product stocks
      for (const update of productUpdates) {
        transaction.update(update.ref, { stock: update.newStock });
      }

      // 5. Create the new order
      const totalAmount = subtotal + shippingFee;
      const newOrderData = {
        userId,
        userName: userData.fullName || user.displayName || user.email || 'N/A',
        userEmail: user.email || 'N/A',
        userPhone: userData.phone || '',
        userAddress: userData.address || '',
        userNeighborhood: userData.neighborhood || '',
        userCity: userData.city || '',
        orderDate: serverTimestamp(),
        statusUpdatedAt: serverTimestamp(),
        paymentMethod,
        subtotal,
        shippingFee,
        totalAmount,
        status: 'Pendente' as const,
        items: validatedOrderItems,
      };
      const newOrderRef = doc(collection(firestore, `users/${userId}/orders`));
      transaction.set(newOrderRef, newOrderData);

      // 6. Clear the shopping cart
      for (const item of cartItems) {
        const cartItemRef = doc(
          firestore,
          `users/${userId}/shoppingCarts/${cartId}/cartItems`,
          item.id
        );
        transaction.delete(cartItemRef);
      }
    });
  } catch (error: any) {
    console.error("Order creation transaction failed: ", error);
    // For other errors, emit a generic permission error for debugging.
    if (!error.message.includes('Estoque insuficiente') && !error.message.includes('não está mais disponível')) {
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
    }
    // Re-throw the error so the UI can display a meaningful message to the user.
    throw error;
  }
}


export async function updateOrderStatus(userId: string, orderId: string, status: OrderStatus) {
  const { firestore } = getClientSdks();
  const orderRef = doc(firestore, `users/${userId}/orders`, orderId);
  try {
    await updateDoc(orderRef, { status, statusUpdatedAt: serverTimestamp() });
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
        const now = new Date();
        const thirtyMinutesAgo = now.getTime() - (30 * 60 * 1000);

        const filtered = ordersData.filter(order => {
            // Rule 1: Always hide "Cancelado" orders.
            if (order.status === 'Cancelado') {
                return false;
            }

            // Rule 2: Hide "Entregue" orders 30 minutes after they are delivered.
            if (order.status === 'Entregue') {
                // If statusUpdatedAt exists, check if it's within the last 30 mins.
                if (order.statusUpdatedAt) {
                    return order.statusUpdatedAt.toDate().getTime() > thirtyMinutesAgo;
                }
                // For older 'Entregue' orders without the timestamp, we'll keep them visible
                // to avoid hiding historical data unexpectedly for the user.
                return true;
            }

            // Show all other statuses (Pendente, Enviado, Atrasado).
            return true;
        });
        
        const sorted = [...filtered].sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
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
