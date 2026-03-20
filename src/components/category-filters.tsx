'use client';

import type { ProductGroup } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { Shapes } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

interface CategoryFiltersProps {
    groups: ProductGroup[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export default function CategoryFilters({ groups, selectedId, onSelect }: CategoryFiltersProps) {
    
    return (
        <div className="relative">
            <Carousel
                opts={{
                    align: 'start',
                    dragFree: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                     {/* "All" button */}
                    <CarouselItem className="pl-4 basis-auto">
                        <div 
                            className="flex flex-col items-center gap-1 cursor-pointer w-14"
                            onClick={() => onSelect('all')}
                            aria-label="Mostrar todas as categorias"
                        >
                            <Button
                                variant={selectedId === 'all' ? 'default' : 'outline'}
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-md"
                            >
                                <Shapes className="h-5 w-5" />
                            </Button>
                            <span className={cn(
                                "text-[10px] leading-tight font-medium text-muted-foreground whitespace-normal text-center",
                                selectedId === 'all' && "text-primary"
                            )}>
                                Todos
                            </span>
                        </div>
                    </CarouselItem>

                    {/* Group buttons */}
                    {groups.map(group => (
                        <CarouselItem key={group.id} className="pl-4 basis-auto">
                            <div 
                                className="flex flex-col items-center gap-1 cursor-pointer w-14"
                                onClick={() => onSelect(group.id)}
                                aria-label={`Filtrar por ${group.name}`}
                            >
                                <Button
                                    variant={selectedId === group.id ? 'default' : 'outline'}
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-md"
                                >
                                    <CategoryIcon categoryName={group.name} className="h-5 w-5" />
                                </Button>
                                <span className={cn(
                                    "text-[10px] leading-tight font-medium text-muted-foreground whitespace-normal text-center",
                                    selectedId === group.id && "text-primary"
                                )}>
                                    {group.name}
                                </span>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
