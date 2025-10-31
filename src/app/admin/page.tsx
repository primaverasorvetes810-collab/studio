
'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, KeyRound, Bell, Menu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type AdminSection = "dashboard" | "orders" | "deliveries" | "products" | "clients" | "birthdays";

const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
  orders: 'Pedidos',
  deliveries: 'Entregas',
  products: 'Produtos',
  clients: 'Clientes',
  birthdays: 'Aniversariantes',
}

export default function AdminGatePage() {
  const { user, isUserLoading } = useUser();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

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
  
  const handleTestNotification = () => {
    if (!("Notification" in window)) {
      toast({
        variant: "destructive",
        title: "Navegador não suportado",
        description: "Este navegador não suporta notificações de desktop.",
      });
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Primavera Delivery", {
        body: "Este é um alarme de teste! Novos pedidos podem ser notificados assim.",
        icon: "/favicon.ico", // Opcional: adicione um ícone
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Permissão concedida!", {
            body: "Agora você pode receber notificações.",
          });
        } else {
            toast({
                title: 'Permissão negada',
                description: 'Você não receberá notificações.'
            });
        }
      });
    } else {
        toast({
            variant: "destructive",
            title: 'Permissão de notificação bloqueada',
            description: 'Você precisa permitir notificações nas configurações do seu navegador.'
        });
    }
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
      <div className='flex items-center justify-between'>
        <PageHeader
          title="Painel de Administração"
          description="Gerencie todos os aspectos da sua loja em um único lugar."
        />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className='gap-2'>
                <Menu className="h-4 w-4" />
                <span>{sectionTitles[activeSection]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={activeSection} onValueChange={(value) => setActiveSection(value as AdminSection)}>
                 {Object.entries(sectionTitles).map(([key, title]) => (
                    <DropdownMenuRadioItem key={key} value={key}>{title}</DropdownMenuRadioItem>
                 ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>

      <div className="mt-8 space-y-8">
        <div>
            {activeSection === 'dashboard' && <DashboardPage />}
            {activeSection === 'orders' && <OrdersPage />}
            {activeSection === 'deliveries' && <DeliveriesPage />}
            {activeSection === 'products' && <ProductsPage />}
            {activeSection === 'clients' && <ClientsPage />}
            {activeSection === 'birthdays' && <BirthdaysPage />}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="text-primary" />
                    Notificações Push (Alarmes)
                </CardTitle>
                <CardDescription>
                    Clique no botão para pedir permissão e enviar uma notificação de teste para o seu dispositivo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleTestNotification}>
                    Testar Alarme
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
