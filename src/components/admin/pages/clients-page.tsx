'use client';

import Link from 'next/link';
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
import { useFirestore } from "@/firebase";
import { type Order } from "@/firebase/orders";
import { type User } from "@/firebase/orders";
import { collection, collectionGroup, getDocs, query } from "firebase/firestore";
import { MoreHorizontal, Loader2, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { formatPrice } from '@/lib/utils';
import ClientDetailPage from './client-detail-page';


interface ClientData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    totalSpent: number;
    lastOrderDate: Date | null;
    orderCount: number;
}


export default function ClientsPage() {
    const [clients, setClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const firestore = useFirestore();

    useEffect(() => {
        const fetchClientsAndOrders = async () => {
          if (!firestore) return;
          setIsLoading(true);
          setError(null);
    
          try {
            // 1. Fetch all users
            const usersQuery = query(collection(firestore, 'users'));
            const usersSnapshot = await getDocs(usersQuery);
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

            // 2. Fetch all orders
            const ordersQuery = query(collectionGroup(firestore, 'orders'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const allOrders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // 3. Create a map of orders by userId
            const ordersByUserId = new Map<string, Order[]>();
            allOrders.forEach(order => {
                if (!ordersByUserId.has(order.userId)) {
                    ordersByUserId.set(order.userId, []);
                }
                ordersByUserId.get(order.userId)!.push(order);
            });
    
            // 4. Combine user data with order data
            const clientsData = users.map(user => {
                const userOrders = ordersByUserId.get(user.id) || [];
                const totalSpent = userOrders.reduce((acc, order) => acc + order.totalAmount, 0);
                const orderCount = userOrders.length;
                
                let lastOrderDate: Date | null = null;
                if (orderCount > 0) {
                    lastOrderDate = userOrders.reduce((latest, order) => {
                        const orderDate = order.orderDate.toDate();
                        return latest > orderDate ? latest : orderDate;
                    }, new Date(0));
                }

                return {
                    id: user.id,
                    name: user.fullName || 'N/A',
                    email: user.email || 'N/A',
                    phone: user.phone,
                    totalSpent,
                    orderCount,
                    lastOrderDate,
                };
            });
    
            setClients(clientsData);

          } catch (e: any) {
             setError("Falha ao carregar clientes. Verifique as permissões do Firestore.");
             if (e.message.includes('permission-denied')) {
                // This might be either users or orders, we'll assume orders for the error
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: 'users', // The error is likely on listing users
                    operation: 'list'
                }));
             }
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchClientsAndOrders();
      }, [firestore]);

    if (selectedClientId) {
      return <ClientDetailPage clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />;
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader title="Clientes" description="Veja informações sobre seus clientes." />
            <Card>
                <CardHeader>
                    <CardTitle>Todos os Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8">
                       {error}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        Nenhum cliente encontrado.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Total Gasto</TableHead>
                                <TableHead>Pedidos</TableHead>
                                <TableHead>Último Pedido</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-sm text-muted-foreground">{client.email}</div>
                                    </TableCell>
                                    <TableCell>{formatPrice(client.totalSpent)}</TableCell>
                                    <TableCell>{client.orderCount}</TableCell>
                                    <TableCell>{client.lastOrderDate?.toLocaleDateString() ?? 'N/A'}</TableCell>
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
                                                <DropdownMenuItem onClick={() => setSelectedClientId(client.id)}>
                                                   <Eye className="mr-2 h-4 w-4" />
                                                   Ver Detalhes
                                                </DropdownMenuItem>
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
