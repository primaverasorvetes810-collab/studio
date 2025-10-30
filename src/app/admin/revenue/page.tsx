'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, collectionGroup } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order } from '@/firebase/orders';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AdminStatsCard } from '@/components/admin-stats-card';

// Custom hook to fetch all orders from all users
function useAllOrders() {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
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
        } as Order));

        allOrders.sort((a, b) => {
            const dateA = a.orderDate?.toDate()?.getTime() || 0;
            const dateB = b.orderDate?.toDate()?.getTime() || 0;
            return dateB - dateA;
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

  return { orders, isLoading, error };
}

export default function RevenuePage() {
  const { orders, isLoading } = useAllOrders();

  const { totalRevenue, paidOrders } = useMemo(() => {
    if (!orders) return { totalRevenue: 0, paidOrders: [] };
    const paid = orders.filter((order) => order.status === 'Pago');
    const revenue = paid.reduce((acc, order) => acc + order.totalAmount, 0);
    return { totalRevenue: revenue, paidOrders: paid };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Receita"
        description="Acompanhe o faturamento da sua loja."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Receita Total (Pedidos Pagos)"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transações Pagas</CardTitle>
        </CardHeader>
        <CardContent>
          {paidOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>ID do Pedido</TableHead>
                  <TableHead>Método de Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.userEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.orderDate.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 7)}...
                    </TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma transação paga encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
