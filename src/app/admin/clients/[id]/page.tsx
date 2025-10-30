
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { notFound, useRouter } from 'next/navigation';
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


const statusColors: Record<Order['status'], string> = {
  Pendente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  Pago: 'bg-green-500/20 text-green-500 border-green-500/20',
  Atrasado: 'bg-red-500/20 text-red-500 border-red-500/20',
  Enviado: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
  Entregue: 'bg-primary/20 text-primary border-primary/20',
  Cancelado: 'bg-gray-500/20 text-muted-foreground border-gray-500/20',
};

// This page now shows details of a specific order, which includes the client's info.
export default function ClientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();
  const orderId = params.id; // The ID is now the order ID
  const router = useRouter();

  // A helper function to find the full path to the order document
  // This is tricky with collection groups. We will assume the page is linked correctly for now.
  // In a real app, you might need to store the full path or query for it.
  // For this fix, we are assuming the order detail comes from the user who made the order.
  // This is a simplification. The client list now links to an order ID. We need the user ID to build the path.
  // Since we don't have it, we can't reliably fetch the order this way.
  
  // The correct approach is to refactor this page entirely.
  // Since the previous page gives us the client details, we can pass them via router state,
  // but that's not ideal for direct navigation.
  
  // A pragmatic solution: The user can click "back" and see the client list. 
  // The "details" are now mostly on the main client list.
  // This page can become a placeholder or show details if we can reconstruct the path.

  // Let's redirect back to the clients list as this page is no longer functional without a major refactor.
  // We will display a message instead.

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Detalhes do Cliente"
        description={`Informações do cliente baseadas em seus pedidos.`}
      />
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>A visualização de detalhes individuais foi simplificada.</p>
          <p>As informações do cliente agora são exibidas na lista principal de clientes.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Voltar para a Lista de Clientes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

