'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingProductCardProps {
  name: string;
  price: number;
  localImageUrl: string;
  progress: number;
}

export function PendingProductCard({
  name,
  price,
  localImageUrl,
  progress,
}: PendingProductCardProps) {
  return (
    <div className="relative">
      <Card className="group flex h-full flex-col overflow-hidden animate-pulse">
        <CardHeader className="p-0">
          <div className="relative aspect-square">
            <Image
              src={localImageUrl}
              alt={`Uploading ${name}`}
              fill
              className="object-cover opacity-70"
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col p-3">
          <div className="flex-grow">
             <h3 className="mb-1 text-base font-semibold truncate">{name}</h3>
             <Skeleton className="h-4 w-3/4" />
          </div>
          <p className="mb-2 mt-2 text-lg font-bold text-primary">{formatPrice(price)}</p>
        </CardContent>
         <CardFooter className="p-3 pt-0">
            <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
      <div className="absolute bottom-0 left-0 w-full p-1">
           <Progress value={progress} className="h-1.5 bg-green-500/20" indicatorClassName="bg-green-500" />
      </div>
    </div>
  );
}
