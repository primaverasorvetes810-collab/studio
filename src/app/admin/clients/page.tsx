
'use client';

import { useEffect, useState, useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { collection, Timestamp, getDocs, query, collectionGroup } from "firebase/firestore";
import Link from "next/link";
import { Order } from '@/firebase/orders';


type ClientFromOrder = {
    id: string; // userId
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    lastOrderId: string; // To link to details page
    lastOrderDate: Date;
    totalOrders: number;
    totalSpent: number;
}


export default function ClientsPage() {
  const firestore = useFirestore();
  const [clients, setClients] = useState<ClientFromOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientsFromOrders() {
      // Don't run if firestore is not available yet.
      if (!firestore) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const ordersQuery = query(collectionGroup(firestore, 'orders'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Aggregate client data from orders
        const clientsMap = new Map<string, ClientFromOrder>();
        
        for (const order of orders) {
            if (!order.userId || !order.userName || !order.userEmail) continue;

            const existingClient = clientsMap.get(order.userId);
            
            // Ensure orderDate is a valid Timestamp before converting
            const orderDate = order.orderDate instanceof Timestamp 
                ? order.orderDate.toDate() 
                : new Date(); // Fallback for safety

            if (existingClient) {
                existingClient.totalOrders += 1;
                existingClient.totalSpent += order.totalAmount;
                if (orderDate > existingClient.lastOrderDate) {
                    existingClient.lastOrderDate = orderDate;
                    existingClient.lastOrderId = order.id;
                }
            } else {
                clientsMap.set(order.userId, {
                    id: order.userId,
                    fullName: order.userName,
                    email: order.userEmail,
                    phone: order.userPhone,
                    address: order.userAddress,
                    neighborhood: order.userNeighborhood,
                    city: order.userCity,
                    lastOrderId: order.id,
                    lastOrderDate: orderDate,
                    totalOrders: 1,
                    totalSpent: order.totalAmount
                });
            }
        }
        
        const clientsList = Array.from(clientsMap.values()).sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());
        setClients(clientsList);

      } catch (e: any) {
         setError("Falha ao carregar clientes. Verifique as permissões do Firestore.");
         errorEmitter.emit('permission-error', new FirestorePermissionError({
             path: 'orders', // This is now a collection group query
             operation: 'list'
         }));
      } finally {
        setIsLoading(false);
      }
    }
    fetchClientsFromOrders();
  }, [firestore]);


  const formatDate = (date: Date) => {
    return date ? date.toLocaleDateString() : 'N/A';
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Clientes" description="Gerencie seus clientes com base em seus pedidos." />
      <Card>
        <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">
                {error}
            </div>
          ) : clients.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato (E-mail)</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Último Pedido</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.fullName || 'Nome não fornecido'}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || 'N/A'}</TableCell>
                  <TableCell>
                    {client.address ? `${client.address}, ${client.neighborhood}, ${client.city}` : 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(client.lastOrderDate)}</TableCell>
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
                            {/* Link to order details which contains client info */}
                            <Link href={`/admin/clients/${client.lastOrderId}`}>Ver Detalhes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum cliente com pedidos encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
