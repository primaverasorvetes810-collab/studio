"use client";

import Image from "next/image";
import type { Product } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              data-ai-hint={imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 text-lg">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
        <Button size="sm" onClick={handleAddToCart}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
