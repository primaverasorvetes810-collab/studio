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

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const placeholder = PlaceHolderImages.find((p) => p.id === product.image);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 text-lg font-headline">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
