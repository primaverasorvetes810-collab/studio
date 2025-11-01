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
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { EmblaCarouselType } from 'embla-carousel-react';

export default function HomeCarousel() {
  const firestore = useFirestore();
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const carouselImagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'carouselImages'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection<CarouselImage>(carouselImagesQuery);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);


  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);


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
    <div className="relative w-full">
        <Carousel 
            setApi={setEmblaApi}
            className="w-full"
            plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: true,
                }),
            ]}
            opts={{
                loop: true,
                align: 'center',
                slidesToScroll: 1,
            }}
        >
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                 <Card className="overflow-hidden">
                    <CardContent className="relative aspect-[2.5/1] p-0">
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
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
        </Carousel>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
                <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        selectedIndex === index ? "w-4 bg-primary" : "bg-primary/50"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    </div>
  );
}
