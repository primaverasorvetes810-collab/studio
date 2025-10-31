import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Pedidos',
    href: '/pedidos',
    icon: ShoppingBag,
  },
  {
    label: 'Produtos',
    href: '/produtos',
    icon: Package,
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    label: 'Verificar Admin',
    href: '/verificar-admin',
    icon: ShieldCheck,
  },
];
