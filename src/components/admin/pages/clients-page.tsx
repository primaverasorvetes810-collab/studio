'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import {
  MoreVertical,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  CircleDollarSign,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType, Order } from '@/firebase/orders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

type ClientWithStats = UserType & {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
};

export default function ClientsPage() {
  const [clientsWithStats, setClientsWithStats] = useState<ClientWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const fetchClientData = async () => {
      setIsLoading(true);
      setError(null);
      if (!firestore) return;
      try {
        const usersRef = collection(firestore, 'users');
        const usersSnap = await getDocs(usersRef);
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));

        const processedClients: ClientWithStats[] = await Promise.all(
          users.map(async (user) => {
            const ordersRef = collection(firestore, `users/${user.id}/orders`);
            const ordersSnap = await getDocs(ordersRef);
            const orders = ordersSnap.docs.map(doc => doc.data() as Order);

            const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            const lastOrder = orders.sort((a, b) => b.orderDate.toMillis() - a.orderDate.toMillis())[0];

            return {
              ...user,
              totalOrders: orders.length,
              totalSpent,
              lastOrderDate: lastOrder ? lastOrder.orderDate.toDate().toLocaleDateString() : null,
            };
          })
        );

        setClientsWithStats(processedClients.sort((a, b) => b.registerTime.toMillis() - a.registerTime.toMillis()));
      } catch (err) {
        console.error("Falha ao carregar dados:", err);
        setError('Falha ao carregar clientes. Verifique as permissões do Firestore.');
      } finally {
        setIsLoading(false);
      }
    };


  useEffect(() => {
    if(firestore) {
      fetchClientData();
    }
  }, [firestore]);


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Carregando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
                 <CardTitle>Erro ao carregar dados</CardTitle>
                 <CardDescription className="text-destructive">{error}</CardDescription>
            </div>
          </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Gerencie os usuários cadastrados no seu sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Total Gasto</TableHead>
                <TableHead className="hidden md:table-cell">Último Pedido</TableHead>
                <TableHead className="text-right">
                    <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientsWithStats.length > 0 ? (
                clientsWithStats.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.fullName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatPrice(client.totalSpent)}</TableCell>
                    <TableCell className="hidden md:table-cell">{client.lastOrderDate || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedClient(client)}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Ver Detalhes</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalhes do Cliente</DialogTitle>
                <DialogDescription>
                    Informações completas e histórico do cliente.
                </DialogDescription>
            </DialogHeader>
            {selectedClient && (
                 <ScrollArea className="max-h-[70vh]">
                     <div className="space-y-4 pr-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-primary"><User size={16} /> Informações Pessoais</h3>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Nome:</span> {selectedClient.fullName}</p>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Email:</span> {selectedClient.email}</p>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Telefone:</span> {selectedClient.phone || 'Não informado'}</p>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Endereço:</span> {selectedClient.address ? `${selectedClient.address}, ${selectedClient.neighborhood} - ${selectedClient.city}` : 'Não informado'}</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2 text-primary"><Calendar size={16} /> Histórico e Atividade</h3>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Cliente desde:</span> {selectedClient.registerTime.toDate().toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Último pedido:</span> {selectedClient.lastOrderDate || 'Nenhum pedido'}</p>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Total de pedidos:</span> {selectedClient.totalOrders}</p>
                            <p className="text-sm text-muted-foreground pl-6"><span className='font-medium'>Total gasto:</span> {formatPrice(selectedClient.totalSpent)}</p>
                        </div>
                     </div>
                 </ScrollArea>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
