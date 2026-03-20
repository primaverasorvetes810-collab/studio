
"use client";

import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice, getProductImageUrl, formatPriceAsString } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser, useStoreSettings } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addProductToCart } from "@/firebase/cart";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductImageUrl(product);
  const imageHint = product.name;

  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { settings } = useStoreSettings();
  const isStoreOpen = settings?.isOpen ?? true;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isStoreOpen) {
      toast({
        variant: "destructive",
        title: "Loja Fechada",
        description: settings?.notice || 'Não estamos aceitando pedidos no momento.',
      });
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }
    addProductToCart(user.uid, product.id);
    toast({
      title: "Sucesso!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20',
        !isStoreOpen && 'grayscale'
      )}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col p-3">
        <div className="flex-grow">
          <CardTitle className="mb-1 text-base font-semibold">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">{product.description}</CardDescription>
        </div>
        <div className="mt-2 text-center">
            <p className="text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">{isMounted ? formatPrice(product.price) : formatPriceAsString(product.price)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0">
        <Button 
            className="w-full" 
            onClick={handleAddToCart}
            disabled={!isStoreOpen}
        >
            Pedir agora
        </Button>
      </CardFooter>
    </Card>
  );
}
