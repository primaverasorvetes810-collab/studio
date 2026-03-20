
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Loader2, User, MapPin, Hash } from 'lucide-react';
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
import { cn, formatPrice, formatPriceAsString } from '@/lib/utils';
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

type OrderFilterStatus = OrderStatus | 'Todos' | 'Atrasado';

interface OrdersPageProps {
  allOrders: Order[];
  isLoading: boolean;
  isOrderDelayed: (order: Order) => boolean;
}

export default function OrdersPage({ allOrders, isLoading, isOrderDelayed }: OrdersPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderFilterStatus>('Todos');
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'Todos') {
        return allOrders;
    }
    if (statusFilter === 'Atrasado') {
        return allOrders.filter(isOrderDelayed);
    }
    return allOrders.filter(order => order.status === statusFilter);
  }, [statusFilter, allOrders, isOrderDelayed]);


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
          <CardTitle className="text-xl md:text-2xl">Sistema de Pedidos</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Gerencie todos os pedidos. Pedidos pendentes por mais de 30 minutos são destacados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <Tabs defaultValue="Todos" onValueChange={(value) => setStatusFilter(value as OrderFilterStatus)}>
             <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-2 mb-4 h-auto flex-wrap p-1">
                <TabsTrigger value="Todos">Todos</TabsTrigger>
                <TabsTrigger value="Pendente">Feitos Agora</TabsTrigger>
                <TabsTrigger value="Atrasado" className="text-destructive">Atrasados</TabsTrigger>
                <TabsTrigger value="Enviado">Enviados</TabsTrigger>
                <TabsTrigger value="Entregue">Entregues</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="border rounded-lg">
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
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                    const isDelayed = order.status === 'Pendente' && isOrderDelayed(order);
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
                                {isDelayed ? 'Atrasado' : order.status}
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
                        Nenhum pedido com este status.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
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
                                        <span>{isMounted ? formatPrice(item.itemPrice * item.quantity) : formatPriceAsString(item.itemPrice * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                            {selectedOrder.subtotal !== undefined && selectedOrder.shippingFee !== undefined ? (
                                <>
                                    <Separator className="my-2"/>
                                    <ul className="space-y-1 text-sm pl-6">
                                        <li className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>{isMounted ? formatPrice(selectedOrder.subtotal) : formatPriceAsString(selectedOrder.subtotal)}</span>
                                        </li>
                                        <li className="flex justify-between text-muted-foreground">
                                            <span>Taxa de Entrega</span>
                                            <span>{isMounted ? formatPrice(selectedOrder.shippingFee) : formatPriceAsString(selectedOrder.shippingFee)}</span>
                                        </li>
                                    </ul>
                                </>
                            ) : null}
                            <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-sm pl-6">
                                <span>Total</span>
                                <span>{isMounted ? formatPrice(selectedOrder.totalAmount) : formatPriceAsString(selectedOrder.totalAmount)}</span>
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
