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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { PrimaveraLogo } from '@/components/icons';
import DashboardPage from './pages/dashboard-page';
import OrdersPage from './pages/orders-page';
import ProductsPage from './pages/products-page';
import ClientsPage from './pages/clients-page';
import DeliveriesPage from './pages/deliveries-page';
import RevenuePage from './pages/revenue-page';

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminPage = 'dashboard' | 'orders' | 'products' | 'clients' | 'deliveries' | 'revenue';

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
      default:
        return <DashboardPage />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-theme(spacing.32))] bg-muted/40">
        <Sidebar className="hidden md:flex md:flex-col md:w-64 border-r bg-sidebar text-sidebar-foreground">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <PrimaveraLogo className="h-10" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActivePage('dashboard')} isActive={activePage === 'dashboard'}>
                  <LayoutDashboard />
                  Painel
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActivePage('orders')} isActive={activePage === 'orders'}>
                  <ShoppingCart />
                  Pedidos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActivePage('products')} isActive={activePage === 'products'}>
                  <Package />
                  Produtos
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActivePage('clients')} isActive={activePage === 'clients'}>
                  <Users />
                  Clientes
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActivePage('deliveries')} isActive={activePage === 'deliveries'}>
                  <Bike />
                  Entregas
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActivePage('revenue')} isActive={activePage === 'revenue'}>
                  <DollarSign />
                  Receita
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout}>
                  <LogOut />
                  Sair
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">{renderActivePage()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
