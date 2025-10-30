
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { collectionGroup, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { OrderWithItems } from '@/firebase/orders';
import { updateOrderStatus } from '@/firebase/orders';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bike, Rocket, BellRing } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PrimaveraLogo } from '@/components/icons';

// Custom hook to fetch all orders and filter for paid ones on the client
function useAllPaidOrders() {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    // Query all orders from the collection group without server-side filtering
    const q = query(collectionGroup(firestore, 'orders'));
    setIsLoading(true);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Filter for "Pago" status on the client-side
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as OrderWithItems));
      
      const paidOrders = allOrders.filter(order => order.status === 'Pago');

      paidOrders.sort((a, b) => {
        const dateA = a.orderDate?.toDate()?.getTime() || 0;
        const dateB = b.orderDate?.toDate()?.getTime() || 0;
        return dateA - dateB; // Sort oldest first
      });

      setOrders(paidOrders);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  return { orders, setOrders, isLoading, error };
}


export default function DeliveriesPage() {
  const { orders: ordersToDeliver, setOrders, isLoading } = useAllPaidOrders();
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const notifiedOrderIds = useRef(new Set<string>());

  // Effect to request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Effect to show notifications for new paid orders
  useEffect(() => {
    if (notificationPermission === 'granted') {
      ordersToDeliver.forEach(order => {
        if (!notifiedOrderIds.current.has(order.id)) {
          new Notification('Novo Pedido para Entrega!', {
            body: `Pedido #${order.id.substring(0,7)} para ${order.userName}. Total: ${formatPrice(order.totalAmount)}`,
            icon: '/logo-notification.png', // You would need to add a logo in your public folder
            lang: 'pt-BR',
            vibrate: [200, 100, 200],
          });
          notifiedOrderIds.current.add(order.id);
        }
      });
    }
  }, [ordersToDeliver, notificationPermission]);


  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
        toast({
            variant: "destructive",
            title: "Navegador não suportado",
            description: "Este navegador não suporta notificações de desktop.",
        });
      return;
    }

    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({
            title: "Notificações Ativadas!",
            description: "Você será notificado sobre novas entregas.",
        });
         new Notification('Notificações Ativadas!', {
            body: 'Você será notificado sobre novas entregas.',
            icon: '/logo-notification.png',
        });
      } else {
        toast({
            variant: "destructive",
            title: "Notificações Bloqueadas",
            description: "Você precisa permitir as notificações nas configurações do seu navegador.",
        });
      }
    });
  };

  const handleStartDelivery = async (order: OrderWithItems) => {
    try {
      await updateOrderStatus(order.userId, order.id, 'Enviado');
      // The real-time listener will automatically update the UI, no need for local state update
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
  
  if (notificationPermission !== 'granted') {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
             <div className="flex justify-center mb-4">
                <BellRing className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Ativar Notificações de Entrega</CardTitle>
             <CardContent className="pt-4">
                <p className="text-muted-foreground mb-6">
                    Para ser alertado sobre novos pedidos em tempo real, você precisa habilitar as notificações em seu navegador.
                </p>
                <Button onClick={requestNotificationPermission}>
                    <BellRing className="mr-2 h-4 w-4" />
                    Habilitar Notificações
                </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }


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
             <p className="text-muted-foreground mt-2">Assim que um pedido for pago, ele aparecerá aqui com uma notificação.</p>
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
