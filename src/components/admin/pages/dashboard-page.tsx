'use client';

import { OverviewChart } from '@/components/overview-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFirestore } from '@/firebase';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, Package, ShoppingBag, Users, Loader2 } from 'lucide-react';
import type { Order } from '@/firebase/orders';
import { collection, getDocs, collectionGroup } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const statusColors: Record<Order["status"], string> = {
  Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  Pago: "bg-green-500/20 text-green-500 border-green-500/20",
  Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
  Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  Entregue: "bg-primary/20 text-primary border-primary/20",
  Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};


export default function DashboardPage() {
    const firestore = useFirestore();
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                if (!firestore) return;
                // Fetch all users to get their IDs
                const usersSnapshot = await getDocs(collection(firestore, 'users'));
                setTotalClients(usersSnapshot.size);

                // Fetch all orders using a collection group query
                const ordersQuery = collectionGroup(firestore, 'orders');
                const ordersSnapshot = await getDocs(ordersQuery);

                const fetchedOrders: Order[] = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                
                const sortedOrders = fetchedOrders.sort((a, b) => b.orderDate.toMillis() - a.orderDate.toMillis());
                setAllOrders(sortedOrders);

                // Calculate stats
                const revenue = sortedOrders.reduce((acc, order) => acc + (order.status === 'Entregue' ? order.totalAmount : 0), 0);
                setTotalRevenue(revenue);
                setTotalOrders(sortedOrders.length);

                // Fetch products count
                const productsSnapshot = await getDocs(collection(firestore, 'products'));
                setTotalProducts(productsSnapshot.size);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (firestore) {
            fetchAllData();
        }

    }, [firestore]);


     const chartData = allOrders
        .filter(order => order.status === 'Entregue' && order.orderDate)
        .reduce((acc, order) => {
            const month = order.orderDate.toDate().toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
            const existingMonth = acc.find(item => item.name === month);
            if (existingMonth) {
                existingMonth.total += order.totalAmount;
            } else {
                acc.push({ name: month, total: order.totalAmount });
            }
            return acc;
        }, [] as { name: string; total: number }[])
        .reverse();

  if (isLoading) {
    return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Baseado em pedidos entregues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total de pedidos no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
             <p className="text-xs text-muted-foreground">Total de usuários cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total de produtos ativos</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Os 5 pedidos mais recentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allOrders.slice(0, 5).map(order => (
                         <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.userName}</div>
                                <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                            </TableCell>
                            <TableCell>
                               <Badge className={statusColors[order.status]} variant="outline">{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
