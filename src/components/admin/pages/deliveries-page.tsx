'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { type Order, type OrderStatus, updateOrderStatus } from '@/firebase/orders';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, Truck, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const statusColors: Record<OrderStatus, string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  Pago: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
  Enviado: 'bg-teal-500/20 text-teal-500 border-teal-500/20',
  Entregue: 'bg-green-500/20 text-green-500 border-green-500/20',
  Cancelado: 'bg-gray-500/20 text-muted-foreground border-gray-500/20',
  Atrasado: 'bg-red-500/20 text-red-500 border-red-500/20',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;
    setIsLoading(true);

    const ordersQuery = collectionGroup(firestore, 'orders');
    const q = query(ordersQuery);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        let fetchedOrders: Order[] = [];
        snapshot.forEach((orderDoc) => {
            fetchedOrders.push({ id: orderDoc.id, ...orderDoc.data() } as Order);
        });

        // Filter for orders that are part of the delivery pipeline
        const deliveryOrders = fetchedOrders.filter(order => 
            order.status === 'Pendente' || order.status === 'Pago' || order.status === 'Enviado'
        );

        const sortedOrders = deliveryOrders.sort(
          (a, b) => a.orderDate.toMillis() - b.orderDate.toMillis()
        );
        setDeliveries(sortedOrders);
        setIsLoading(false);
    }, (error) => {
        console.error('Error fetching deliveries:', error);
        toast({
            variant: 'destructive',
            title: 'Erro ao carregar entregas',
            description: 'Não foi possível buscar os pedidos para entrega.'
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);
  
  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.userId, order.id, newStatus);
      toast({
        title: 'Status atualizado!',
        description: `O pedido #${order.id.substring(0, 7)} foi marcado como ${newStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
      });
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-2">Carregando entregas...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Entregas</CardTitle>
        <CardDescription>
          Gerencie os pedidos que precisam ser preparados e enviados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Endereço</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length > 0 ? (
              deliveries.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.userPhone || order.userEmail}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="font-medium">{order.userAddress}</div>
                    <div className="text-sm text-muted-foreground">{order.userNeighborhood}, {order.userCity}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={cn(statusColors[order.status])} variant="outline">
                      <Truck className="mr-1 h-3 w-3" />
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(order.status === 'Pendente' || order.status === 'Pago') && (
                            <DropdownMenuItem onSelect={() => handleStatusChange(order, 'Enviado')}>
                                Marcar como Enviado
                            </DropdownMenuItem>
                        )}
                        {order.status === 'Enviado' && (
                          <DropdownMenuItem onSelect={() => handleStatusChange(order, 'Entregue')}>
                            Marcar como Entregue
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum pedido para entrega no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
