'use client';

import type { Product, ProductGroup } from '@/lib/data/products';
import { ProductCard } from './product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ProductCarouselProps {
  group: ProductGroup;
  products: Product[];
}

export function ProductCarousel({ group, products }: ProductCarouselProps) {
    // Filter products that belong to this group
    const groupProducts = products.filter(p => p.groupId === group.id);

    if (groupProducts.length === 0) {
        return null; // Don't render the carousel if there are no products in this group
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{group.name}</h2>
            <Carousel
                opts={{
                align: 'start',
                dragFree: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                {groupProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <ProductCard product={product} />
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="hidden -left-4 sm:flex" />
                <CarouselNext className="hidden -right-4 sm:flex" />
            </Carousel>
        </div>
    );
}
