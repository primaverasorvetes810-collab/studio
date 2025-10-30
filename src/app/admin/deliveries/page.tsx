
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collectionGroup, query, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { OrderWithItems } from '@/firebase/orders';
import { updateOrderStatus } from '@/firebase/orders';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bike, Rocket } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Custom hook to fetch all orders
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
            return dateA - dateB; // Sort oldest first
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

  return { orders, setOrders, isLoading, error };
}

export default function DeliveriesPage() {
  const { orders, setOrders, isLoading } = useAllOrders();
  const { toast } = useToast();

  const ordersToDeliver = useMemo(() => {
    return orders.filter(order => order.status === 'Pago');
  }, [orders]);

  const handleStartDelivery = async (order: OrderWithItems) => {
    try {
      await updateOrderStatus(order.userId, order.id, 'Enviado');
      // Update local state to immediately reflect the change
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === order.id ? { ...o, status: 'Enviado' } : o)
      );
      toast({
        title: 'Entrega Iniciada!',
        description: `O pedido de ${order.userName} está a caminho.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível iniciar a entrega.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Entregas Pendentes"
        description="Pedidos com pagamento confirmado aguardando envio."
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : ordersToDeliver.length === 0 ? (
        <Card className="text-center py-16">
           <CardContent>
             <Bike className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
             <h3 className="text-xl font-semibold">Nenhuma entrega pendente!</h3>
             <p className="text-muted-foreground mt-2">Assim que um pedido for pago, ele aparecerá aqui.</p>
           </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ordersToDeliver.map((order) => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{order.userName}</CardTitle>
                <p className="text-sm text-muted-foreground">Pedido #{order.id.substring(0, 7)}</p>
                <p className="text-sm text-muted-foreground">{order.orderDate.toDate().toLocaleString()}</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                    <h4 className="font-semibold text-sm">Endereço:</h4>
                    <p className="text-sm">{order.userAddress}, {order.userNeighborhood}, {order.userCity}</p>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold text-sm mb-2">Itens:</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                        {order.items.map(item => (
                            <li key={item.id}>
                                {item.quantity}x {item.product.name}
                            </li>
                        ))}
                    </ul>
                </div>
                 <Separator />
                 <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                 </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleStartDelivery(order)}>
                  <Rocket className="mr-2 h-4 w-4" />
                  Iniciar Entrega
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
