'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardPage from '@/components/admin/pages/dashboard-page';
import OrdersPage from '@/components/admin/pages/orders-page';
import ProductsPage from '@/components/admin/pages/products-page';
import ClientsPage from '@/components/admin/pages/clients-page';
import PageHeader from '@/components/page-header';

export default function AdminPage() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // This could be used to redirect if access is determined on the client-side
    // after initial loading, but for now, we render conditionally.
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center text-center">
        <Card className="max-w-md">
            <CardHeader className="items-center">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <CardTitle className="text-2xl">Acesso Negado</CardTitle>
                <CardDescription>
                Você não tem permissão para acessar esta página. Apenas administradores podem ver este conteúdo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Voltar para a Página Inicial</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Painel de Administração"
        description="Gerencie todos os aspectos da sua loja em um único lugar."
      />
      <Tabs defaultValue="dashboard" className="mt-8">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <DashboardPage />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <OrdersPage />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductsPage />
        </TabsContent>
        <TabsContent value="clients" className="mt-6">
          <ClientsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
