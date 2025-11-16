'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, doc, updateDoc, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order, OrderStatus } from '@/firebase/orders';
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
import { MoreVertical, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusColors: Record<OrderStatus, string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  Enviado: 'bg-teal-500/20 text-teal-500 border-teal-500/20',
  Entregue: 'bg-green-500/20 text-green-500 border-green-500/20',
  Cancelado: 'bg-gray-500/20 text-muted-foreground border-gray-500/20',
};

const selectableStatuses: OrderStatus[] = ['Pendente', 'Enviado', 'Entregue'];

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllOrders = async () => {
      setIsLoading(true);
      if (!firestore) return;
      try {
        const ordersQuery = collectionGroup(firestore, 'orders');
        const ordersSnapshot = await getDocs(ordersQuery);
        
        let fetchedOrders: Order[] = [];
        ordersSnapshot.forEach((orderDoc) => {
            fetchedOrders.push({ id: orderDoc.id, ...orderDoc.data() } as Order);
        });

        // Filtra os pedidos cancelados e ordena o restante
        const activeOrders = fetchedOrders.filter(order => order.status !== 'Cancelado');
        const sortedOrders = activeOrders.sort(
          (a, b) => b.orderDate.toMillis() - a.orderDate.toMillis()
        );
        setAllOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching all orders:', error);
         toast({
            variant: 'destructive',
            title: 'Erro ao carregar pedidos',
            description: 'Não foi possível buscar os pedidos. Verifique as permissões do Firestore.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if(firestore) {
        fetchAllOrders();
    }
  }, [firestore, toast]);

  const handleStatusChange = async (orderId: string, userId: string, newStatus: OrderStatus) => {
    if (!firestore) return;
    const orderRef = doc(firestore, `users/${userId}/orders`, orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
      
      if (newStatus === 'Cancelado') {
        setAllOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
      } else {
        setAllOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
      
      toast({
        title: 'Status atualizado',
        description: `O pedido foi marcado como ${newStatus}.`,
      });
    } catch (error) {
        console.error('Error updating order status:', error);
         toast({
            variant: 'destructive',
            title: 'Erro ao atualizar',
            description: 'Não foi possível alterar o status do pedido.'
        });
    }
  };

  const isOrderDelayed = (order: Order): boolean => {
    if (order.status === 'Pendente' && order.orderDate) {
      const now = new Date();
      const orderDate = order.orderDate.toDate();
      const diffMinutes = (now.getTime() - orderDate.getTime()) / (1000 * 60);
      return diffMinutes > 30;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Pedidos Ativos</CardTitle>
        <CardDescription>
          Gerencie todos os pedidos que não foram cancelados. Pedidos com status 'Pendente' por mais de 30 minutos são destacados em vermelho.
          <br />
          <b>Pendente:</b> Aguardando preparo. | <b>Enviado:</b> A caminho do cliente. | <b>Entregue:</b> Pedido finalizado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Produtos</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders.length > 0 ? (
              allOrders.map((order) => {
                const isDelayed = isOrderDelayed(order);
                const productNames = order.items.map(item => `${item.product.name} (x${item.quantity})`).join(', ');
                return (
                <TableRow 
                    key={order.id}
                    className={cn(isDelayed && 'bg-red-500/10 hover:bg-red-500/20')}
                >
                  <TableCell className="w-[40%] font-medium truncate pr-2 py-2">
                    <div className="truncate">{order.userName || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={cn(statusColors[order.status], isDelayed && 'border-red-500/50 text-red-500')} variant="outline">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-2 text-muted-foreground truncate">
                    {productNames}
                  </TableCell>
                  <TableCell className="py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {selectableStatuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={order.status === status}
                            onSelect={() =>
                              handleStatusChange(order.id, order.userId, status as OrderStatus)
                            }
                          >
                            Marcar como {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                )
            })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
