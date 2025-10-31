"use client";

import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PlusCircle } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addProductToCart } from "@/firebase/cart";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const placeholder = PlaceHolderImages.find((p) => p.id === product.image);
  const imageUrl = product.image.startsWith('data:image') ? product.image : placeholder?.imageUrl;
  const imageHint = product.image.startsWith('data:image') ? product.name : placeholder?.imageHint;


  const { user } = useUser();
  const auth = useAuth();
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
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4">
        <div className="flex-grow">
          <CardTitle className="mb-1 text-lg">{product.name}</CardTitle>
          <CardDescription className="line-clamp-1 text-sm">{product.description}</CardDescription>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
            <Button size="xs" onClick={handleAddToCart}>
              <PlusCircle className="mr-1 h-3 w-3" />
              Adicionar
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
