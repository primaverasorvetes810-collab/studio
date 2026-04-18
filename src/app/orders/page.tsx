'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { useUserOrders, type OrderWithItems, updateOrderStatus, OrderStatus } from '@/firebase/orders';
import { formatPrice, formatPriceAsString } from "@/lib/utils";
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
import OrderTimer from '@/components/order-timer';


const statusColors: Record<OrderStatus, string> = {
  Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
  Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  Entregue: "bg-green-500/20 text-green-500 border-green-500/20",
  Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

const statusDisplayMessages: Record<OrderStatus, string> = {
  Pendente: "Veja o que você acabou de pedir aqui!",
  Enviado: "Chegaremos em breve",
  Entregue: "Obrigado pela preferência",
  Atrasado: "Pedido Atrasado",
  Cancelado: "Pedido Cancelado",
};

export default function OrdersPage() {
  const { user, isUserLoading } = useUser();
  const { orders, isLoading: areOrdersLoading, setOrders } = useUserOrders(user?.uid);
  const { toast } = useToast();

  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCancelConfirm = async () => {
    if (!orderToCancel || !user) return;

    try {
      await updateOrderStatus(user.uid, orderToCancel.id, 'Cancelado');
      
      // Optimistically remove the canceled order from the UI
      setOrders(prevOrders => 
        prevOrders.filter(o => o.id !== orderToCancel.id)
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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mt-4">Você precisa estar logado para ver seus pedidos.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center px-4 py-8 text-center">
        <div className="relative mt-8 h-64 w-64">
          <Image
            src="https://res.cloudinary.com/du4ccw2pg/image/upload/q_auto/f_auto/v1776468768/ChatGPT_Image_17_de_abr._de_2026_20_29_01_zxrws8.png"
            alt="Nenhum pedido encontrado"
            fill
            className="object-contain"
          />
        </div>
        <p className="mt-8 text-xl font-semibold">Você ainda não fez nenhum pedido.</p>
        <Button asChild className="mt-6 py-4 px-8 text-lg">
          <Link href="/">Ver Produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Seus pedidos estão lá embaixo. Confira!"
      />
      <Card className="mt-8">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {orders.map((order) => (
              <AccordionItem value={order.id} key={order.id}>
                <AccordionTrigger className="flex w-full flex-col items-start gap-4 px-6 py-4 text-base hover:no-underline">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-bold text-xl">{statusDisplayMessages[order.status]}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="hidden sm:inline font-bold text-primary">{isMounted ? formatPrice(order.totalAmount) : formatPriceAsString(order.totalAmount)}</span>
                        <Badge className={cn("whitespace-nowrap px-4 py-3 text-lg", statusColors[order.status])} variant="outline">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    <OrderTimer order={order} />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4 text-xl">
                    <p className="font-semibold text-lg">Você Pediu</p>
                    <ul className="space-y-2">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.product.name} x {item.quantity}</span>
                                <span>{isMounted ? formatPrice(item.itemPrice * item.quantity) : formatPriceAsString(item.itemPrice * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {order.subtotal !== undefined && order.shippingFee !== undefined ? (
                        <>
                            <Separator />
                            <ul className="space-y-1 text-muted-foreground">
                                <li className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{isMounted ? formatPrice(order.subtotal) : formatPriceAsString(order.subtotal)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Taxa de Entrega</span>
                                    <span>{isMounted ? formatPrice(order.shippingFee) : formatPriceAsString(order.shippingFee)}</span>
                                </li>
                            </ul>
                        </>
                    ) : null}

                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{isMounted ? formatPrice(order.totalAmount) : formatPriceAsString(order.totalAmount)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Forma de Pagamento</span>
                        <span>{order.paymentMethod}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Data do Pedido</span>
                        <span>{order.orderDate ? order.orderDate.toDate().toLocaleString() : 'Processando...'}</span>
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
      
      <div className="mt-8 flex flex-col items-center gap-8">
          <Image
            src="https://res.cloudinary.com/du4ccw2pg/image/upload/q_auto/f_auto/v1776471564/Primavera_5_wl97md.png"
            alt="Banner promocional"
            width={800}
            height={200}
            className="rounded-lg object-contain"
          />
      </div>

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
