'use client';

import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
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
import { type Order, type User } from "@/firebase/orders";
import { formatPrice } from "@/lib/utils";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { collection, query, getDocs, collectionGroup } from "firebase/firestore";

const statusColors: Record<Order["status"], string> = {
    Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
    Pago: "bg-green-500/20 text-green-500 border-green-500/20",
    Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
    Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
    Entregue: "bg-primary/20 text-primary border-primary/20",
    Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

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


export default function OrdersAdminPage() {
    const { orders, isLoading, error } = useAllOrders();

    return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Pedidos" description="Gerencie os pedidos dos clientes." />
          <Card>
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8">
                        Ocorreu um erro ao carregar os pedidos.
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        Nenhum pedido encontrado.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>ID do Pedido</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>
                            <span className="sr-only">Ações</span>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                            <TableCell>
                              <div className="font-medium">{order.userName || 'Nome não disponível'}</div>
                              <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                            </TableCell>
                            <TableCell>
                                <Badge className={cn(statusColors[order.status])} variant="outline">{order.status}</Badge>
                            </TableCell>
                            <TableCell>{order.orderDate.toDate().toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                            <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Alternar menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                    <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
          </Card>
        </div>
      );
}
