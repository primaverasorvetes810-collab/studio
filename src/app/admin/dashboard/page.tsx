
"use client";

import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { AdminStatsCard } from "@/components/admin-stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { OverviewChart } from "@/components/overview-chart";
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, getDocs, collectionGroup } from 'firebase/firestore';
import { useMemo, useState, useEffect } from "react";
import type { Order, User } from "@/firebase/orders";
import type { Product } from "@/lib/data/products";


// Custom hook to fetch all orders from all users using a collection group query
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
                if (e instanceof Error && e.message.includes('permission-denied')) {
                    const contextualError = new FirestorePermissionError({
                        path: 'orders', // This is a collection group, path is not straightforward
                        operation: 'list',
                    });
                    errorEmitter.emit('permission-error', contextualError);
                    setError(contextualError);
                } else {
                    setError(e as Error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [firestore]);

    return { orders, isLoading, error };
}

const statusColors: Record<Order["status"], string> = {
  Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  Pago: "bg-green-500/20 text-green-500 border-green-500/20",
  Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
  Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  Entregue: "bg-primary/20 text-primary border-primary/20",
  Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

export default function DashboardPage() {
  const { orders, isLoading: isLoadingOrders } = useAllOrders();
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const { totalProducts } = useMemo(() => {
    if (!products) {
      return { totalProducts: 0 };
    }
    return { totalProducts: products.length };
  }, [products]);

  const recentOrders = orders.slice(0, 5);
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Painel" description="Uma visão geral da sua loja." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatsCard
          title="Receita Total"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
        />
        <AdminStatsCard
          title="Pedidos"
          value={isLoadingOrders ? <Loader2 className="h-6 w-6 animate-spin" /> : `+${orders.length}`}
          icon={ShoppingCart}
        />
        <AdminStatsCard
          title="Produtos Cadastrados"
          value={isLoadingProducts ? <Loader2 className="h-6 w-6 animate-spin" /> : totalProducts.toString()}
          icon={Package}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Você tem {orders.length} pedidos no total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.userName || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn("whitespace-nowrap", statusColors[order.status])} variant="outline">
                         {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    

    
