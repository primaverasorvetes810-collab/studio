'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';
import type { CarouselImage } from '@/firebase/carousel';
import Autoplay from "embla-carousel-autoplay";

export default function HomeCarousel() {
  const firestore = useFirestore();

  const carouselImagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'carouselImages'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection<CarouselImage>(carouselImagesQuery);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64 w-full bg-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!images || images.length === 0) {
    return null; // Don't render anything if there are no images
  }

  return (
    <Carousel 
        className="w-full"
        plugins={[
            Autoplay({
              delay: 5000,
            }),
        ]}
        opts={{
            loop: true,
        }}
    >
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
             <Card>
                <CardContent className="relative aspect-video p-0">
                    <Link href={image.link || '#'} target="_blank" rel="noopener noreferrer">
                         <Image
                            src={image.imageUrl}
                            alt={image.altText || 'Carousel Image'}
                            fill
                            className="object-cover rounded-lg"
                            />
                    </Link>
                </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
