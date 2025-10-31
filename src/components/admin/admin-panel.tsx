
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  LogOut,
  DollarSign,
  Bike,
  Menu,
  Cake,
  ShieldQuestion,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PrimaveraLogo } from '@/components/icons';
import DashboardPage from './pages/dashboard-page';
import OrdersPage from './pages/orders-page';
import ProductsPage from './pages/products-page';
import ClientsPage from './pages/clients-page';
import DeliveriesPage from './pages/deliveries-page';
import RevenuePage from './pages/revenue-page';
import BirthdaysPage from './pages/birthdays-page';
import VerifyAdminPage from './pages/verify-admin-page';

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminPage =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'clients'
  | 'deliveries'
  | 'revenue'
  | 'birthdays'
  | 'verify-admin';

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return <ProductsPage />;
      case 'clients':
        return <ClientsPage />;
      case 'deliveries':
        return <DeliveriesPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'birthdays':
        return <BirthdaysPage />;
      case 'verify-admin':
        return <VerifyAdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  const navItems = [
    {
      page: 'dashboard' as AdminPage,
      icon: LayoutDashboard,
      label: 'Painel',
    },
    { page: 'orders' as AdminPage, icon: ShoppingCart, label: 'Pedidos' },
    { page: 'products' as AdminPage, icon: Package, label: 'Produtos' },
    { page: 'clients' as AdminPage, icon: Users, label: 'Clientes' },
    { page: 'deliveries' as AdminPage, icon: Bike, label: 'Entregas' },
    { page: 'revenue' as AdminPage, icon: DollarSign, label: 'Receita' },
    { page: 'birthdays' as AdminPage, icon: Cake, label: 'Aniversários' },
    { page: 'verify-admin' as AdminPage, icon: ShieldQuestion, label: 'Verificar Admin' },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <PrimaveraLogo className="h-8" />
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
              return (
                <Button
                  key={item.page}
                  variant="ghost"
                  onClick={() => setActivePage(item.page)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all justify-start ${
                    activePage === item.page
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
            </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>
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
                <span className="sr-only">Alternar menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <SheetHeader className="p-4 border-b">
                 <SheetTitle className="sr-only">Menu de Administração</SheetTitle>
               </SheetHeader>
               <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Pode adicionar um campo de busca aqui no futuro */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
