'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { PrimaveraLogo } from '@/components/icons';
import { NavItems } from '@/components/admin/nav-items';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    try {
      const accessGranted = sessionStorage.getItem('admin-vault-access') === 'granted';
      if (!accessGranted) {
        router.replace('/acesso-cofre');
      }
    } catch (error) {
        router.replace('/acesso-cofre');
    }
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    try {
        sessionStorage.removeItem('admin-vault-access');
    } catch (error) {
        // Ignora erros de sessionStorage
    }
    router.push('/');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <PrimaveraLogo className="h-6" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {NavItems.map((item, index) => (
              <SidebarMenuItem key={index}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2" />
            <span>Sair</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="sm:hidden" />
            <h1 className="text-lg font-semibold">
              {NavItems.find((item) => item.href === pathname)?.label || 'Painel'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
