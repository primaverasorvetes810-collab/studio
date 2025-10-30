
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
import { collectionGroup, getDocs, query } from "firebase/firestore";
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
    const firestore = useFirestore();

    useEffect(() => {
        const fetchClientsFromOrders = async () => {
          if (!firestore) return;
          setIsLoading(true);
          setError(null);
    
          try {
            const ordersQuery = query(collectionGroup(firestore, 'orders'));
            const ordersSnapshot = await getDocs(ordersQuery);
    
            const clientsMap = new Map<string, ClientData>();
    
            ordersSnapshot.forEach(doc => {
              const order = doc.data() as Order;
              const userId = order.userId;
    
              if (!clientsMap.has(userId)) {
                clientsMap.set(userId, {
                  id: userId,
                  name: order.userName || 'N/A',
                  email: order.userEmail || 'N/A',
                  phone: order.userPhone,
                  totalSpent: 0,
                  lastOrderDate: null,
                  orderCount: 0,
                });
              }
    
              const client = clientsMap.get(userId)!;
              client.totalSpent += order.totalAmount;
              client.orderCount += 1;
              const orderDate = order.orderDate.toDate();
              if (!client.lastOrderDate || orderDate > client.lastOrderDate) {
                client.lastOrderDate = orderDate;
              }
            });
    
            const clientsArray = Array.from(clientsMap.values());
            setClients(clientsArray);

          } catch (e: any) {
             setError("Falha ao carregar clientes. Verifique as permissões do Firestore.");
             if (e.message.includes('permission-denied')) {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: 'orders', // This is now a collection group query
                    operation: 'list'
                }));
             }
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchClientsFromOrders();
      }, [firestore]);


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
                                                <DropdownMenuItem asChild>
                                                   <Link href={`/admin/clients/${client.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver Detalhes
                                                    </Link>
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
