'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import {
  MoreVertical,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { promoteUserToAdmin } from '@/firebase/roles';
import { useToast } from '@/hooks/use-toast';
import type { User, Order } from '@/firebase/orders';


type ClientWithStats = User & {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  isAdmin: boolean;
};

export default function ClientsPage() {
  const [clientsWithStats, setClientsWithStats] = useState<ClientWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersRef = collection(firestore, 'users');
        const usersSnap = await getDocs(usersRef);
        const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

        const processedClients: ClientWithStats[] = await Promise.all(
          users.map(async (user) => {
            const ordersRef = collection(firestore, `users/${user.id}/orders`);
            const ordersSnap = await getDocs(ordersRef);
            const orders = ordersSnap.docs.map(doc => doc.data() as Order);

            const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            const lastOrder = orders.sort((a, b) => b.orderDate.toMillis() - a.orderDate.toMillis())[0];

            const adminRoleRef = doc(firestore, 'roles_admin', user.id);
            const adminSnap = await getDoc(adminRoleRef);

            return {
              ...user,
              totalOrders: orders.length,
              totalSpent,
              lastOrderDate: lastOrder ? lastOrder.orderDate.toDate().toLocaleDateString() : null,
              isAdmin: adminSnap.exists(),
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

    if(firestore) {
      fetchData();
    }
  }, [firestore]);


  const handlePromote = (userId: string, userEmail: string) => {
    promoteUserToAdmin(userId, userEmail)
      .then(() => {
        toast({
          title: 'Sucesso!',
          description: `${userEmail} agora é um administrador.`,
        });
        // Atualiza o estado local para refletir a mudança
        setClientsWithStats(prev => prev.map(c => c.id === userId ? { ...c, isAdmin: true } : c));
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Erro ao promover',
          description: error.message || 'Não foi possível promover o usuário.',
        });
      });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
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
              <TableHead>Status</TableHead>
              <TableHead>
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
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatPrice(client.totalSpent)}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.lastOrderDate || 'N/A'}</TableCell>
                   <TableCell>
                    {client.isAdmin ? (
                      <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-700">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Cliente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handlePromote(client.id, client.email)} disabled={client.isAdmin}>
                          Tornar Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
