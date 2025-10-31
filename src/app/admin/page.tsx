'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardPage from '@/components/admin/pages/dashboard-page';
import OrdersPage from '@/components/admin/pages/orders-page';
import ProductsPage from '@/components/admin/pages/products-page';
import ClientsPage from '@/components/admin/pages/clients-page';
import PageHeader from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import DeliveriesPage from '@/components/admin/pages/deliveries-page';
import BirthdaysPage from '@/components/admin/pages/birthdays-page';

export default function AdminGatePage() {
  const { user, isUserLoading } = useUser();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const correctPassword = "810Primavera*";

  const handlePasswordCheck = () => {
    setIsChecking(true);
    setTimeout(() => { // Simula uma verificação
      if (password === correctPassword) {
        setIsAdminAuthenticated(true);
        toast({
          title: 'Acesso Concedido',
          description: 'Bem-vindo ao Painel de Administração.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'A senha inserida está incorreta.',
        });
      }
      setIsChecking(false);
      setPassword('');
    }, 500);
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center text-center">
        <Card className="max-w-md">
            <CardHeader className="items-center">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <CardTitle className="text-2xl">Acesso Negado</CardTitle>
                <CardDescription>
                Você precisa estar logado para acessar o painel de administração.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/login">Fazer Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
        <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="items-center text-center">
                    <KeyRound className="h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl">Acesso ao Cofre</CardTitle>
                    <CardDescription>
                        Insira a senha de administrador para acessar o painel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="admin-password">Senha de Administrador</Label>
                        <Input 
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordCheck()}
                            placeholder="********"
                        />
                    </div>
                    <Button onClick={handlePasswordCheck} className="w-full" disabled={isChecking}>
                        {isChecking ? <Loader2 className="animate-spin" /> : "Entrar"}
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="deliveries">Entregas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="birthdays">Aniversariantes</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <DashboardPage />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <OrdersPage />
        </TabsContent>
        <TabsContent value="deliveries" className="mt-6">
          <DeliveriesPage />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductsPage />
        </TabsContent>
        <TabsContent value="clients" className="mt-6">
          <ClientsPage />
        </TabsContent>
         <TabsContent value="birthdays" className="mt-6">
          <BirthdaysPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
