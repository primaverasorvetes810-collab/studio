
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrimaveraLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, User, LogOut, Menu, Home, Box, HelpCircle } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email[0].toUpperCase();
  };

  const navLinks = [
    { href: "/", label: "Produtos", icon: Home },
    { href: "/orders", label: "Meus Pedidos", icon: Box, requiresAuth: true },
    { href: "/ajuda", label: "Ajuda", icon: HelpCircle },
    { href: "/admin", label: "Admin", icon: User, requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - always visible */}
        <Link href="/" className="flex items-center space-x-2">
          <PrimaveraLogo className="h-10" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {!isUserLoading &&
            navLinks.map((link) => 
              (!link.requiresAuth || user) && (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            )}
        </nav>

        {/* Icons - Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Carrinho de Compras</span>
            </Link>
          </Button>

          {isUserLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL ?? ""}
                      alt={user.displayName ?? "Usuário"}
                    />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || "Usuário"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetClose asChild>
                <Link href="/" className="mb-4">
                  <PrimaveraLogo className="h-10" />
                </Link>
              </SheetClose>
              
              <nav className="flex flex-1 flex-col gap-2">
                {navLinks.map((link) => 
                  (!link.requiresAuth || user) && (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  )
                )}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t pt-4">
                <SheetClose asChild>
                   <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/cart">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Carrinho
                      </Link>
                    </Button>
                </SheetClose>
                {!isUserLoading && !user && (
                    <SheetClose asChild>
                        <Button className="w-full justify-start" asChild>
                           <Link href="/login">
                               <User className="mr-2 h-4 w-4" />
                               Login
                           </Link>
                        </Button>
                    </SheetClose>
                )}
                 {user && (
                     <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                       <LogOut className="mr-2 h-4 w-4" />
                       Sair
                     </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
