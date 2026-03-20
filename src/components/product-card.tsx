"use client";

import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser, useStoreSettings } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addProductToCart } from "@/firebase/cart";
import { cn } from "@/lib/utils";

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
  const isStoreOpen = settings?.isOpen ?? true; // Default to open while loading

  const handleAddToCart = () => {
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
      onClick={handleAddToCart}
      className={cn(
        'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20',
        isStoreOpen ? 'cursor-pointer' : 'cursor-not-allowed',
        !isStoreOpen && 'grayscale'
      )}
      role="button"
      aria-label={`Adicionar ${product.name} ao carrinho`}
      tabIndex={isStoreOpen ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAddToCart();
        }
      }}
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
      <CardContent className="flex flex-grow flex-col p-3 pb-4">
        <div className="flex-grow">
          <CardTitle className="mb-1 text-base font-semibold">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">{product.description}</CardDescription>
        </div>
        <div className="mt-2">
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
