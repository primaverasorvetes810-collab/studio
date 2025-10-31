
'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from '@/firebase';
import { useUserOrders, type OrderWithItems, updateOrderStatus } from '@/firebase/orders';
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


const statusColors: Record<OrderWithItems["status"], string> = {
  Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  Pago: "bg-green-500/20 text-green-500 border-green-500/20",
  Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
  Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  Entregue: "bg-primary/20 text-primary border-primary/20",
  Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

export default function OrdersPage() {
  const { user, isUserLoading } = useUser();
  const { orders, isLoading: areOrdersLoading, setOrders } = useUserOrders(user?.uid);
  const { toast } = useToast();

  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null);

  const handleCancelConfirm = async () => {
    if (!orderToCancel || !user) return;

    try {
      await updateOrderStatus(user.uid, orderToCancel.id, 'Cancelado');
      
      // Update local state to reflect the change immediately
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === orderToCancel.id ? { ...o, status: 'Cancelado' } : o
        )
      );

      toast({
        title: 'Pedido cancelado',
        description: 'Seu pedido foi cancelado com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível cancelar o pedido.',
      });
    } finally {
      setOrderToCancel(null);
    }
  };


  if (isUserLoading || areOrdersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Meus Pedidos"
          description="Verifique o status dos seus pedidos recentes."
        />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <PageHeader
          title="Meus Pedidos"
          description="Verifique o status dos seus pedidos recentes."
        />
        <p className="mt-4">Você precisa estar logado para ver seus pedidos.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <PageHeader
          title="Meus Pedidos"
          description="Verifique o status dos seus pedidos recentes."
        />
        <p className="mt-4">Você ainda não fez nenhum pedido.</p>
        <Button asChild className="mt-4">
          <Link href="/">Ver Produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Meus Pedidos"
        description="Verifique o status dos seus pedidos recentes."
      />
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {orders.map((order) => (
              <AccordionItem value={order.id} key={order.id}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold">Pedido #{order.id.substring(0, 7)}</span>
                      <span className="text-sm text-muted-foreground">
                        {order.orderDate ? order.orderDate.toDate().toLocaleDateString() : 'Processando...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="hidden sm:inline font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                       <Badge className={cn("whitespace-nowrap", statusColors[order.status])} variant="outline">
                         {order.status}
                       </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4">
                    <p className="font-semibold">Itens:</p>
                    <ul className="space-y-2">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between text-sm">
                                <span>{item.product.name} x {item.quantity}</span>
                                <span>{formatPrice(item.itemPrice * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Forma de Pagamento</span>
                        <span>{order.paymentMethod}</span>
                    </div>
                    {order.status === 'Pendente' && (
                        <>
                            <Separator />
                            <div className="flex justify-end">
                                <Button 
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setOrderToCancel(order)}
                                >
                                    Cancelar Pedido
                                </Button>
                            </div>
                        </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação cancelará seu pedido. Você não poderá desfazê-la.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive hover:bg-destructive/90">
              Sim, cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
