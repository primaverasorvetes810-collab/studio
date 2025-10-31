'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, collectionGroup, doc, getDoc } from 'firebase/firestore';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { Loader2, Mail, Phone, Home, ShoppingBag, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { AdminStatsCard } from '@/components/admin-stats-card';
import { type Order } from '@/firebase/orders';
import { Button } from '@/components/ui/button';


interface ClientDetails {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: Date | null;
}

interface ClientDetailPageProps {
    clientId: string;
    onBack: () => void;
}

export default function ClientDetailPage({ clientId, onBack }: ClientDetailPageProps) {
  const firestore = useFirestore();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !clientId) return;

    const fetchClientData = async () => {
      setIsLoading(true);
      
      const ordersRef = collectionGroup(firestore, 'orders');
      
      try {
        const querySnapshot = await getDocs(query(ordersRef, where('userId', '==', clientId)));
        
        const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        if (userOrders.length === 0) {
            // If no orders, fetch user data directly
            const userRef = doc(firestore, 'users', clientId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setClient({
                    id: clientId,
                    name: userData.fullName || 'Não disponível',
                    email: userData.email || 'Não disponível',
                    phone: userData.phone,
                    address: userData.address,
                    neighborhood: userData.neighborhood,
                    city: userData.city,
                    totalSpent: 0,
                    orderCount: 0,
                    lastOrderDate: null,
                });
            }
            setIsLoading(false);
            return;
        }

        // Sort orders to find the latest one for contact info
        userOrders.sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
        
        const latestOrder = userOrders[0];
        const totalSpent = userOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        const lastOrderDate = latestOrder.orderDate.toDate();
  
        setClient({
          id: clientId,
          name: latestOrder.userName || 'Não disponível',
          email: latestOrder.userEmail || 'Não disponível',
          phone: latestOrder.userPhone,
          address: latestOrder.userAddress,
          neighborhood: latestOrder.userNeighborhood,
          city: latestOrder.userCity,
          totalSpent,
          orderCount: userOrders.length,
          lastOrderDate,
        });
  
        setClientOrders(userOrders);

      } catch(e) {
        console.error("Failed to fetch client data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [firestore, clientId]);


  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!client) {
    return <PageHeader title="Cliente não encontrado" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={client.name} description={`Detalhes do cliente e histórico de pedidos.`}>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Lista
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{client.name ? client.name.charAt(0) : 'N'}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{client.name}</CardTitle>
                <p className="text-sm text-muted-foreground">ID do Cliente: {client.id.substring(0, 7)}...</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{client.phone || 'Não informado'}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                    <p>{client.address || 'Endereço não informado'}</p>
                    <p>{client.neighborhood}, {client.city}</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminStatsCard 
                title="Total Gasto"
                value={formatPrice(client.totalSpent)}
                icon={DollarSign}
            />
             <AdminStatsCard 
                title="Total de Pedidos"
                value={client.orderCount.toString()}
                icon={ShoppingBag}
            />
             <AdminStatsCard 
                title="Último Pedido"
                value={client.lastOrderDate?.toLocaleDateString() ?? 'N/A'}
                icon={Calendar}
            />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
        {clientOrders.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID do Pedido</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {clientOrders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.id.substring(0, 7)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.orderDate.toDate().toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">{formatPrice(order.totalAmount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
