"use client";

import Link from "next/link";
import Image from "next/image";
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Box,
  HelpCircle,
  Shield,
} from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email[0].toUpperCase();
  };

  const navLinks = [
    { href: "/products", label: "Produtos", icon: Package },
    { href: "/orders", label: "Meus Pedidos", icon: Box, requiresAuth: true },
    { href: "/profile", label: "Meu Perfil", icon: User, requiresAuth: true },
    { href: "/ajuda", label: "Ajuda", icon: HelpCircle },
    { href: "/admin", label: "Admin", icon: Shield },
  ];

  const renderLink = (link: (typeof navLinks)[0]) => {
    if (link.requiresAuth && !user) return null;
    return true;
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-colors duration-300",
      isScrolled ? "border-b bg-background/80 backdrop-blur-sm" : "border-b border-transparent"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Image
                  src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773958646/Delivery__5_-removebg-preview_tbxaii.png"
                  alt="Abrir menu"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                <SheetDescription className="sr-only">
                  Navegue pelo site usando os links abaixo.
                </SheetDescription>
              </SheetHeader>
              <SheetClose asChild>
                <Link href="/" className="mb-4">
                  <PrimaveraLogo className="h-8" />
                </Link>
              </SheetClose>

              <nav className="flex flex-1 flex-col gap-2">
                {navLinks.map(
                  (link) =>
                    renderLink(link) && (
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
                {isUserLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-md p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.photoURL ?? ""}
                          alt={user.displayName ?? "Usuário"}
                        />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <p className="truncate text-sm font-medium leading-none">
                          {user.displayName || "Usuário"}
                        </p>
                        <p className="truncate text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button className="w-full justify-start" asChild>
                      <Link href="/login">
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Logo */}
          <Link href="/" className="hidden md:flex">
            <PrimaveraLogo className="h-8" />
          </Link>
        </div>

        {/* Mobile Logo */}
        <Link href="/" className="md:hidden">
          <PrimaveraLogo className="h-8" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks
            .filter((link) => !(link as any).isMobileOnly)
            .map(
              (link) =>
                renderLink(link) && (
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

        {/* Right side icons */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="inline-flex"
          >
            <Link href="/cart">
              <ShoppingCart className="h-7 w-7" />
              <span className="sr-only">Carrinho de Compras</span>
            </Link>
          </Button>

          {isUserLoading ? (
            <div className="hidden h-8 w-8 animate-pulse rounded-full bg-muted md:block" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative hidden h-8 w-8 rounded-full md:flex"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL ?? ""}
                      alt={user.displayName ?? "Usuário"}
                    />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Abrir menu do usuário</span>
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
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="hidden md:flex">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
