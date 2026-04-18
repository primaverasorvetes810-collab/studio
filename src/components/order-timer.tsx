'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Info, Timer } from 'lucide-react';
import type { OrderWithItems } from '@/firebase/orders';

interface OrderTimerProps {
  order: OrderWithItems;
}

const ORDER_DELIVERY_TIME_MINUTES = 40;

export default function OrderTimer({ order }: OrderTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!order.orderDate) {
      return;
    }

    const orderTime = order.orderDate.toDate().getTime();
    const expirationTime = orderTime + ORDER_DELIVERY_TIME_MINUTES * 60 * 1000;

    const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const distance = expirationTime - now;

        if (distance < 0) {
            setTimeLeft('Tempo esgotado');
            setIsExpired(true);
            return false; // Indicates timer should stop
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        return true; // Indicates timer should continue
    };

    // Run once immediately
    if (!calculateTimeLeft()) {
        return; // Stop if already expired
    }

    const intervalId = setInterval(() => {
      if (!calculateTimeLeft()) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [order.orderDate]);

  // Only show timer for pending or sent orders
  if (order.status !== 'Pendente' && order.status !== 'Enviado') {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border bg-muted/50 p-4">
      <Timer className={`h-8 w-8 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
      <div className="flex-1 text-center">
        <p className="font-semibold text-base">{isExpired ? 'Pedido pode estar atrasado' : 'Tempo estimado restante'}</p>
        <p className={`text-4xl font-bold font-mono ${isExpired ? 'text-destructive' : 'text-primary'}`}>
          {timeLeft}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Info className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Ver informação da entrega</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estimativa de Entrega</AlertDialogTitle>
            <AlertDialogDescription>
              Seu pedido chegará em aproximadamente 40 minutos a partir do momento em que foi feito. Este é um tempo estimado e pode variar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
