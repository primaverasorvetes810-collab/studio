'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, KeyRound, Menu } from 'lucide-react';
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
import AdminHelpPage from './ajuda/page';
import CarouselManagerPage from '@/components/admin/pages/carousel-manager-page';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatPrice } from '@/lib/utils';

type AdminSection = "dashboard" | "orders" | "deliveries" | "products" | "clients" | "birthdays" | "carousel" | "help";

const sectionTitles: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
  orders: 'Pedidos',
  deliveries: 'Entregas',
  products: 'Produtos',
  clients: 'Clientes',
  birthdays: 'Aniversariantes',
  carousel: 'Carrossel',
  help: 'Ajuda',
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

  // Efeito para ouvir novos pedidos
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    // A função é definida e usada apenas dentro do useEffect (client-side)
    const showNotification = (totalAmount: number) => {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.error("Erro ao tocar som de notificação:", e));

      const notification = new Notification("Novo Pedido Recebido!", {
        body: `Um novo pedido no valor de ${formatPrice(totalAmount)} acaba de chegar!`,
        icon: "/favicon.ico",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        // Você pode adicionar uma navegação para a página de pedidos aqui se desejar
        // Por exemplo: router.push('/admin/orders');
      };
    };

    const handleNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { orderId, totalAmount } = customEvent.detail;
      
      console.log('Novo pedido recebido (evento):', orderId);

      if (!("Notification" in window)) {
        toast({
          title: 'Novo Pedido!',
          description: `Um pedido de ${formatPrice(totalAmount)} foi criado.`,
        });
        return;
      }

      if (Notification.permission === "granted") {
        showNotification(totalAmount);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            showNotification(totalAmount);
          }
        });
      }
    };

    document.addEventListener('new-order', handleNewOrder);

    return () => {
      document.removeEventListener('new-order', handleNewOrder);
    };
  }, [isAdminAuthenticated, toast]);
  
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
      <div className='flex flex-col gap-4'>
        <div className="flex justify-end">
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
        <PageHeader
          title="Painel de Administração"
          description="Gerencie todos os aspectos da sua loja em um único lugar."
        />
      </div>

      <div className="mt-8 space-y-8">
        <div>
            {activeSection === 'dashboard' && <DashboardPage />}
            {activeSection === 'orders' && <OrdersPage />}
            {activeSection === 'deliveries' && <DeliveriesPage />}
            {activeSection === 'products' && <ProductsPage />}
            {activeSection === 'clients' && <ClientsPage />}
            {activeSection === 'birthdays' && <BirthdaysPage />}
            {activeSection === 'carousel' && <CarouselManagerPage />}
            {activeSection === 'help' && <AdminHelpPage />}
        </div>
      </div>
    </div>
  );
}
