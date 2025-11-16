

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2, ShieldAlert, KeyRound, Home, ShoppingCart, Truck, Package, Users, Gift, Settings, LifeBuoy, Image as ImageIcon, Shield, Menu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DashboardPage from '@/components/admin/pages/dashboard-page';
import OrdersPage from '@/components/admin/pages/orders-page';
import ProductsPage from '@/components/admin/pages/products-page';
import ClientsPage from '@/components/admin/pages/clients-page';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import DeliveriesPage from '@/components/admin/pages/deliveries-page';
import BirthdaysPage from '@/components/admin/pages/birthdays-page';
import AdminHelpPage from './ajuda/page';
import CarouselManagerPage from '@/components/admin/pages/carousel-manager-page';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";


type AdminSection = "dashboard" | "orders" | "deliveries" | "products" | "clients" | "birthdays" | "carousel" | "help";

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'deliveries', label: 'Entregas', icon: Truck },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'birthdays', label: 'Aniversariantes', icon: Gift },
    { id: 'carousel', label: 'Carrossel', icon: ImageIcon },
    { id: 'help', label: 'Ajuda', icon: LifeBuoy },
] as const;


export default function AdminGatePage() {
  const { user, isUserLoading } = useUser();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const correctPassword = "810Primavera*";

  const handlePasswordCheck = () => {
    setIsChecking(true);
    setTimeout(() => { 
      if (password === correctPassword) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('adminAuthenticated', 'true');
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

  useEffect(() => {
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
        setIsAdminAuthenticated(true);
    }
  }, []);
  
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
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
    <TooltipProvider>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <nav className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6 text-primary" />
              <span className="">Painel Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
               {navItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as AdminSection)}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        activeSection === item.id && "bg-muted text-primary"
                    )}
                 >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                 </button>
               ))}
            </nav>
          </div>
        </div>
      </nav>
      <div className="flex flex-col">
         <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                 <SheetHeader>
                  <SheetTitle className="sr-only">Menu do Painel</SheetTitle>
                  <SheetDescription className="sr-only">Navegue pelas seções do painel de administração.</SheetDescription>
                </SheetHeader>
                <nav className="grid gap-2 text-base font-medium">
                  <SheetClose asChild>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                      <Shield className="h-6 w-6 text-primary" />
                      <span >Painel Admin</span>
                    </Link>
                  </SheetClose>
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id as AdminSection)}
                        className={cn(
                            "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                            activeSection === item.id && "bg-muted text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                <h1 className="text-lg font-semibold md:text-2xl">{navItems.find(item => item.id === activeSection)?.label}</h1>
            </div>
         </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {activeSection === 'dashboard' && <DashboardPage />}
          {activeSection === 'orders' && <OrdersPage />}
          {activeSection === 'deliveries' && <DeliveriesPage />}
          {activeSection === 'products' && <ProductsPage />}
          {activeSection === 'clients' && <ClientsPage />}
          {activeSection === 'birthdays' && <BirthdaysPage />}
          {activeSection === 'carousel' && <CarouselManagerPage />}
          {activeSection === 'help' && <AdminHelpPage />}
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}
