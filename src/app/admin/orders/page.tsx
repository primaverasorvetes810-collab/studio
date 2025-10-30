
'use client';

import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Order, type OrderWithItems } from "@/firebase/orders";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { useEffect, useState } from "react";
import { collectionGroup, getDocs, query } from "firebase/firestore";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelector } from "@/components/order-status-selector";


// Custom hook to fetch all orders from all users
function useAllOrders() {
    const firestore = useFirestore();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) return;

        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const ordersQuery = query(collectionGroup(firestore, 'orders'));
                const ordersSnapshot = await getDocs(ordersQuery);
                
                const allOrders = ordersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as OrderWithItems));

                allOrders.sort((a, b) => {
                    const dateA = a.orderDate?.toDate()?.getTime() || 0;
                    const dateB = b.orderDate?.toDate()?.getTime() || 0;
                    return dateB - dateA;
                });
                
                setOrders(allOrders);
            } catch (e) {
                setError(e as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [firestore]);

    return { orders, isLoading, error, setOrders };
}


export default function OrdersAdminPage() {
    const { orders, isLoading, error, setOrders } = useAllOrders();
    const [_, setTicker] = useState(0); // Used to force re-renders for time-based updates

    useEffect(() => {
        const interval = setInterval(() => {
          setTicker(prev => prev + 1);
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Pedidos" description="Gerencie os pedidos dos clientes." />
          <Card>
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                     <div className="flex justify-center items-center h-64 p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8 p-6">
                        Ocorreu um erro ao carregar os pedidos.
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 p-6">
                        Nenhum pedido encontrado.
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {orders.map((order) => (
                        <AccordionItem value={order.id} key={order.id} className="border-b">
                             <div className="flex items-center justify-between w-full px-6 py-4">
                                <AccordionTrigger className="p-0 flex-1 text-left hover:no-underline">
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-base">{order.userName}</span>
                                        <span className="text-sm text-muted-foreground">Pedido #{order.id.substring(0, 7)}...</span>
                                    </div>
                                </AccordionTrigger>
                                <div className="flex items-center gap-4 ml-4">
                                    <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                                    <OrderStatusSelector order={order} onStatusChange={handleStatusChange} />
                                </div>
                            </div>
                             <AccordionContent className="px-6 pb-4 bg-muted/50">
                                <div className="space-y-4 pt-4">
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
                                        <div>
                                            <h4 className='font-semibold mb-2'>Detalhes do Cliente</h4>
                                            <div className='text-sm space-y-1'>
                                                <p><span className='text-muted-foreground'>Email:</span> {order.userEmail}</p>
                                                <p><span className='text-muted-foreground'>Telefone:</span> {order.userPhone || 'N/A'}</p>
                                                <p><span className='text-muted-foreground'>Endereço:</span> {order.userAddress || 'N/A'}, {order.userNeighborhood}, {order.userCity}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className='font-semibold mb-2'>Detalhes do Pedido</h4>
                                            <div className='text-sm space-y-1'>
                                                <p><span className='text-muted-foreground'>Data:</span> {order.orderDate.toDate().toLocaleString()}</p>
                                                <p><span className='text-muted-foreground'>Pagamento:</span> {order.paymentMethod}</p>
                                                <p><span className='text-muted-foreground'>Status:</span> {order.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className='font-semibold mb-2'>Itens do Pedido</h4>
                                        <ul className="space-y-2">
                                            {order.items.map((item) => (
                                                <li key={item.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-background">
                                                    <div>
                                                        <span className='font-medium'>{item.product.name}</span>
                                                        <span className='text-muted-foreground'> (Qtd: {item.quantity})</span>
                                                    </div>
                                                    <span>{formatPrice(item.itemPrice * item.quantity)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-end font-bold text-lg">
                                        <span>Total: {formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </CardContent>
          </Card>
        </div>
      );
}
