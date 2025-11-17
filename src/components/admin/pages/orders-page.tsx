
'use client';

import { useEffect, useState, useRef } from 'react';
import { collectionGroup, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Order, OrderStatus, updateOrderStatus } from '@/firebase/orders';
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
import { MoreVertical, Loader2, User, Phone, MapPin, Hash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn, formatPrice } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusColors: Record<OrderStatus, string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/30',
  Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
  Enviado: 'bg-teal-500/20 text-teal-500 border-teal-500/20 hover:bg-teal-500/30',
  Entregue: 'bg-green-500/20 text-green-500 border-green-500/20 hover:bg-green-500/30',
  Cancelado: 'bg-gray-500/20 text-muted-foreground border-gray-500/20',
};

const selectableStatuses: OrderStatus[] = ['Pendente', 'Enviado', 'Entregue'];

function playNotificationSound() {
    // Som de alerta alto de um recurso público
    const audio = new Audio('https://www.soundjay.com/misc/sounds/sonar-ping-sound-effect.mp3');
    audio.play().catch(error => {
      // A reprodução automática pode ser bloqueada pelo navegador até que o usuário interaja com a página.
      console.log("Falha ao reproduzir som de notificação:", error);
    });
}

function sendNotification(title: string, options: NotificationOptions) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    playNotificationSound();
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        playNotificationSound();
        new Notification(title, options);
      }
    });
  }
}

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const previousOrdersRef = useRef<Order[]>([]);

  useEffect(() => {
    if (!firestore) return;

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

        // Check for new orders only after the initial load
        if (previousOrdersRef.current.length > 0) {
            const previousOrderIds = new Set(previousOrdersRef.current.map(o => o.id));
            const newOrders = sortedOrders.filter(
                o => !previousOrderIds.has(o.id) && o.status === 'Pendente'
            );

            newOrders.forEach(order => {
                sendNotification('Novo Pedido Recebido!', {
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


  useEffect(() => {
    const cancelOldOrders = async () => {
      if (!firestore || allOrders.length === 0) return;

      const now = new Date();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const ordersToCancel = allOrders.filter(order => {
        if (!order.orderDate) return false;
        
        const isOld = now.getTime() - order.orderDate.toDate().getTime() > twentyFourHours;
        const isCancellable = order.status === 'Pendente' || order.status === 'Enviado';
        
        return isOld && isCancellable;
      });

      if (ordersToCancel.length > 0) {
        toast({
          title: 'Limpeza automática',
          description: `Cancelando ${ordersToCancel.length} pedido(s) com mais de 24 horas.`,
        });

        for (const order of ordersToCancel) {
          try {
            await updateOrderStatus(order.userId, order.id, 'Cancelado');
          } catch (error) {
            console.error(`Failed to cancel order ${order.id}:`, error);
          }
        }
      }
    };

    if (!isLoading) {
        cancelOldOrders();
    }
  }, [allOrders, firestore, isLoading, toast]);


  const handleStatusChange = async (
    order: Order,
    newStatus: OrderStatus
  ) => {
    if (!firestore) return;
    
    try {
      await updateOrderStatus(order.userId, order.id, newStatus);
      
      toast({
        title: 'Status atualizado',
        description: `O pedido foi marcado como ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível alterar o status do pedido.',
      });
    }
  };

  const isOrderDelayed = (order: Order): boolean => {
    if (order.status === 'Pendente') {
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

  const renderClientName = (name: string | null) => {
    if (!name) return <div className="font-medium truncate">N/A</div>;
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div>
            <div className="font-medium truncate">{firstName}</div>
            {lastName && <div className="text-xs text-muted-foreground truncate">{lastName}</div>}
        </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl md:text-2xl">Todos os Pedidos Ativos</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Gerencie todos os pedidos ativos. Pedidos com status 'Pendente' por mais de 30 minutos são destacados em vermelho.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] px-2 py-2 md:px-4">Cliente</TableHead>
                <TableHead className="px-2 py-2 md:px-4">Status</TableHead>
                <TableHead className="hidden sm:table-cell px-2 py-2 md:px-4 max-w-[120px] truncate">Produtos</TableHead>
                <TableHead className="px-2 py-2 md:px-4">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allOrders.length > 0 ? (
                allOrders.map((order) => {
                  const isDelayed = isOrderDelayed(order);
                  const productNames = order.items
                    .map((item) => `${item.product.name} (x${item.quantity})`)
                    .join(', ');
                  return (
                    <TableRow
                      key={order.id}
                      className={cn(
                        isDelayed && 'bg-red-500/10 hover:bg-red-500/20'
                      )}
                    >
                      <TableCell className="w-[40%] pr-2 py-2 px-2 md:px-4">
                        {renderClientName(order.userName)}
                      </TableCell>
                       <TableCell className="py-2 px-2 md:px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Badge className={cn("cursor-pointer", statusColors[order.status], isDelayed && 'border-red-500/50 text-red-500')} variant="outline">
                               {order.status}
                             </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {selectableStatuses.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                disabled={order.status === status}
                                onSelect={() =>
                                  handleStatusChange(order, status as OrderStatus)
                                }
                              >
                                Marcar como {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-2 px-2 md:px-4 text-muted-foreground truncate max-w-[150px]">
                        {productNames}
                      </TableCell>
                      <TableCell className="py-2 px-2 md:px-4">
                         <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                           <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Ver detalhes</span>
                         </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalhes do Pedido</DialogTitle>
                <DialogDescription>
                    Informações completas do pedido e do cliente.
                </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
                 <ScrollArea className="max-h-[70vh]">
                     <div className="space-y-4 pr-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><User size={16} /> Cliente</h3>
                            <p className="text-sm text-muted-foreground pl-6">{selectedOrder.userName}</p>
                            <p className="text-sm text-muted-foreground pl-6">{selectedOrder.userEmail}</p>
                            <p className="text-sm text-muted-foreground pl-6">{selectedOrder.userPhone}</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><MapPin size={16} /> Endereço de Entrega</h3>
                            <p className="text-sm text-muted-foreground pl-6">{selectedOrder.userAddress}</p>
                            <p className="text-sm text-muted-foreground pl-6">{selectedOrder.userNeighborhood}, {selectedOrder.userCity}</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Hash size={16} /> Resumo do Pedido</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground pl-6">
                                {selectedOrder.items.map(item => (
                                    <li key={item.id} className='flex justify-between'>
                                        <span>{item.product.name} x{item.quantity}</span>
                                        <span>{formatPrice(item.itemPrice * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-sm pl-6">
                                <span>Total</span>
                                <span>{formatPrice(selectedOrder.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm pl-6">
                                <span className="text-muted-foreground">Pagamento</span>
                                <span>{selectedOrder.paymentMethod}</span>
                            </div>
                        </div>
                     </div>
                 </ScrollArea>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}

    

    