'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
  runTransaction,
  query,
  getDocs,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getSdks, useCollection, useMemoFirebase } from '@/firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import type { CartItemWithProduct } from './cart';
import type { Product } from '@/lib/data/products';
import { products as staticProducts } from '@/lib/data/products';

export interface Order {
  id: string;
  userId: string;
  orderDate: Timestamp;
  paymentMethod: string;
  totalAmount: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Atrasado';
}

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

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

export async function createOrderFromCart(
  userId: string,
  cartId: string,
  cartItems: CartItemWithProduct[],
  paymentMethod: string,
  totalAmount: number
) {
  const { firestore } = getSdks();
  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Create a new order document
      const ordersCollection = collection(firestore, `users/${userId}/orders`);
      const newOrderRef = doc(ordersCollection);
      const newOrder: Omit<Order, 'id'> = {
        userId,
        orderDate: serverTimestamp() as Timestamp,
        paymentMethod,
        totalAmount,
        status: 'Pendente',
      };
      transaction.set(newOrderRef, newOrder);

      // 2. Create order items for each item in the cart
      const orderItemsCollection = collection(firestore, `orders/${newOrderRef.id}/orderItems`);
      for (const cartItem of cartItems) {
        const newOrderItemRef = doc(orderItemsCollection);
        const newOrderItem: Omit<OrderItem, 'id'> = {
          orderId: newOrderRef.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          itemPrice: cartItem.product.price,
        };
        transaction.set(newOrderItemRef, newOrderItem);
      }

      // 3. Delete all items from the user's cart
      const cartItemsCollectionRef = collection(firestore, `users/${userId}/shoppingCarts/${cartId}/cartItems`);
      for (const cartItem of cartItems) {
        const cartItemRef = doc(cartItemsCollectionRef, cartItem.id);
        transaction.delete(cartItemRef);
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

async function getOrderItems(orderId: string): Promise<OrderItemWithProduct[]> {
    const { firestore } = getSdks();
    const itemsCollection = collection(firestore, `orders/${orderId}/orderItems`);
    const q = query(itemsCollection);

    try {
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return [];
        }

        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderItem));

        // Join with static product data
        return items.map(item => {
            const product = staticProducts.find(p => p.id === item.productId);
            return { ...item, product: product! };
        }).filter(item => item.product);

    } catch (e: any) {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: `orders/${orderId}/orderItems`,
                operation: 'list',
            })
        );
        return [];
    }
}


export function useUserOrders(userId?: string) {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { firestore } = getSdks();

    const ordersQuery = useMemoFirebase(() => {
        if (!userId) return null;
        return query(collection(firestore, `users/${userId}/orders`));
    }, [userId, firestore]);

    const { data: ordersData, isLoading: areOrdersLoading, error } = useCollection<Order>(ordersQuery);

    useEffect(() => {
        if (areOrdersLoading || !ordersData) {
            setIsLoading(areOrdersLoading);
            return;
        }

        if (error) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        const fetchAllOrderItems = async () => {
            setIsLoading(true);
            const ordersWithItems = await Promise.all(
                ordersData.map(async (order) => {
                    const items = await getOrderItems(order.id);
                    return { ...order, items };
                })
            );
            if (isMounted) {
                setOrders(ordersWithItems.sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime()));
                setIsLoading(false);
            }
        };

        fetchAllOrderItems();

        return () => {
            isMounted = false;
        };
    }, [ordersData, areOrdersLoading, error]);

    return { orders, isLoading, error };
}
