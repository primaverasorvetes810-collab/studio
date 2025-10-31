
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
import { ShoppingCart, User, LogOut, Menu, HelpCircle, Users } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useState } from 'react';

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
    { href: "/", label: "Produtos" },
    { href: "/orders", label: "Meus Pedidos", requiresAuth: true },
    { href: "/ajuda", label: "Ajuda" },
    { href: "/admin", label: "Admin", requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <PrimaveraLogo className="h-10" />
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navLinks.map((link) => 
              (!link.requiresAuth || (!isUserLoading && user)) && (
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
        </div>

        <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
              <Link href="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil do Usuário</span>
              </Link>
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 p-4">
                  <SheetClose asChild>
                     <Link href="/" className="mb-4">
                        <PrimaveraLogo className="h-10" />
                     </Link>
                  </SheetClose>
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => 
                        (!link.requiresAuth || (!isUserLoading && user)) && (
                            <SheetClose asChild key={link.href}>
                                <Link
                                    href={link.href}
                                    className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    {link.label}
                                </Link>
                             </SheetClose>
                        )
                    )}
                     {!user && !isUserLoading && (
                        <SheetClose asChild>
                           <Link
                                href="/login"
                                className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                           >
                               Login
                           </Link>
                        </SheetClose>
                     )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
