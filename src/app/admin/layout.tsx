
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import AdminLoginPage from './login/page';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check for sessionStorage is a client-side only operation.
    if (typeof window !== 'undefined') {
        const sessionAuth = sessionStorage.getItem('adminAuthenticated');
        if (sessionAuth === 'true') {
          setIsAuthenticated(true);
        } else if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
        setIsLoading(false);
    }
  }, [pathname, router]);

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('adminAuthenticated', 'true');
        setIsAuthenticated(true);
        router.push('/admin/dashboard');
    }
  };

  const handleLogout = () => {
     if (typeof window !== 'undefined') {
        sessionStorage.removeItem('adminAuthenticated');
        setIsAuthenticated(false);
        router.push('/admin/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the path is the login page, render it directly.
  // Otherwise, if not authenticated, the effect above will have already started a redirect.
  // We still show the loader while redirecting.
  if (!isAuthenticated) {
    if (pathname === '/admin/login') {
        return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar className="hidden md:flex md:flex-col md:w-64 border-r bg-sidebar text-sidebar-foreground">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <PrimaveraLogo className="h-10" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard />
                    Painel
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/orders">
                    <ShoppingCart />
                    Pedidos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/products">
                    <Package />
                    Produtos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/clients">
                    <Users />
                    Clientes
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/deliveries">
                    <Bike />
                    Entregas
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/revenue">
                    <DollarSign />
                    Receita
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  Sair
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
