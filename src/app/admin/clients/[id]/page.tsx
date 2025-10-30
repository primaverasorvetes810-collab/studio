
'use client';

import { notFound } from 'next/navigation';
import PageHeader from '@/components/page-header';
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
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { Order } from '@/firebase/orders';

type Client = {
  id: string;
  fullName: string;
  email: string;
  registerTime?: { toDate: () => Date };
  phone?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
};

// Static Data
const staticClient: Client = {
  id: 'vera-123',
  fullName: 'Vera',
  email: 'primaverasorvetes810@gmail.com',
  registerTime: { toDate: () => new Date('2023-10-30') },
  phone: '15998154015',
  address: 'Izolina Martins Telles, 29',
  neighborhood: 'Jardim Vante',
  city: 'Porto Feliz',
};

const staticOrders: Order[] = [
  // This client has no orders yet, so this is empty.
  // Example of what an order would look like:
  // {
  //   id: 'order-001',
  //   userId: 'vera-123',
  //   orderDate: { toDate: () => new Date('2024-05-10') },
  //   totalAmount: 150.75,
  //   status: 'Entregue',
  //   paymentMethod: 'Cartão de Crédito ou Débito',
  //   userName: 'Vera',
  //   userEmail: 'primaverasorvetes810@gmail.com',
  //   items: []
  // }
];


const statusColors: Record<Order['status'], string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  Pago: 'bg-green-500/20 text-green-500 border-green-500/20',
  Atrasado: 'bg-red-500/20 text-red-500 border-red-500/20',
  Enviado: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
  Entregue: 'bg-primary/20 text-primary border-primary/20',
  Cancelado: 'bg-gray-500/20 text-muted-foreground border-gray-500/20',
};

export default function ClientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const client = staticClient;
  const orders = staticOrders;
  const isClientLoading = false;
  const areOrdersLoading = false;

  if (isClientLoading || areOrdersLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return notFound();
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={client.fullName}
        description={`Cliente desde ${client.registerTime?.toDate().toLocaleDateString() ?? 'data desconhecida'}`}
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="grid gap-1">
              <span className="font-semibold">E-mail:</span>
              <span>{client.email}</span>
            </div>
            <div className="grid gap-1">
              <span className="font-semibold">Telefone:</span>
              <span>{client.phone || 'N/A'}</span>
            </div>
            <div className="grid gap-1">
              <span className="font-semibold">Endereço:</span>
              <span>{`${client.address || ''}, ${client.neighborhood || ''}, ${client.city || ''}`}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Total de Pedidos</span>
              <span className="text-lg font-bold">{orders.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Total Gasto</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(totalSpent)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
          <CardDescription>
            Todos os pedidos feitos por {client.fullName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 7)}...
                    </TableCell>
                    <TableCell>
                      {order.orderDate.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(statusColors[order.status])}
                        variant="outline"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Este cliente ainda não fez nenhum pedido.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
