"use client";

import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice, getProductImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addProductToCart } from "@/firebase/cart";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getProductImageUrl(product);
  const imageHint = product.name;

  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = () => {
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
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
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
        <div className="mt-2">
            <p className="mb-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
      </CardContent>
       <CardFooter className="p-3 pt-0">
         <Button size="sm" className="w-full" onClick={handleAddToCart}>
           <span className="sm:hidden">Adicionar</span>
           <span className="hidden sm:inline">Adicionar ao carrinho</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
