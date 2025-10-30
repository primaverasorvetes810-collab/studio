
'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Order, type OrderStatus, updateOrderStatus } from '@/firebase/orders';
import { useToast } from '@/hooks/use-toast';

const allStatuses: OrderStatus[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'];

interface OrderStatusSelectorProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderStatusSelector({ order, onStatusChange }: OrderStatusSelectorProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);

  const getStatusColor = (status: OrderStatus, orderDate: Date): string => {
    const now = new Date();
    const ageInMinutes = (now.getTime() - orderDate.getTime()) / (1000 * 60);

    if (status === 'Pendente') {
      if (ageInMinutes > 30) {
        return 'bg-red-500/20 text-red-500 border-red-500/20'; // Atrasado
      }
      if (ageInMinutes > 10) {
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'; // Atenção
      }
    }

    const statusColors: Record<OrderStatus, string> = {
        Pendente: "bg-blue-500/20 text-blue-500 border-blue-500/20",
        Pago: "bg-green-500/20 text-green-500 border-green-500/20",
        Enviado: "bg-purple-500/20 text-purple-500 border-purple-500/20",
        Entregue: "bg-primary/20 text-primary border-primary/20",
        Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
        Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
      };

    return statusColors[status];
  };

  const handleValueChange = async (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus); // Optimistic update
    onStatusChange(order.id, newStatus);

    try {
      await updateOrderStatus(order.userId, order.id, newStatus);
      toast({
        title: 'Status atualizado!',
        description: `O pedido #${order.id.substring(0, 7)} foi atualizado para "${newStatus}".`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setCurrentStatus(order.status);
      onStatusChange(order.id, order.status);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status do pedido.',
      });
    }
  };

  return (
    <Select onValueChange={handleValueChange} defaultValue={currentStatus}>
      <SelectTrigger
        className={cn(
          'w-[120px] h-auto p-0 border-0 focus:ring-0 focus:ring-offset-0',
          getStatusColor(currentStatus, order.orderDate.toDate())
        )}
        aria-label={`Status do pedido: ${currentStatus}`}
      >
        <SelectValue asChild>
            <Badge variant="outline" className="w-full justify-center whitespace-nowrap border-0">
                {currentStatus}
            </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
