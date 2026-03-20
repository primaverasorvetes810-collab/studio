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
                <CarouselContent className="-ml-6">
                     {/* "All" button */}
                    <CarouselItem className="pl-6 basis-auto">
                        <div 
                            className="flex flex-col items-center gap-2 cursor-pointer w-16"
                            onClick={() => onSelect('all')}
                            aria-label="Mostrar todas as categorias"
                        >
                            <Button
                                variant={selectedId === 'all' ? 'default' : 'outline'}
                                size="icon"
                                className="h-16 w-16 rounded-full shadow-md"
                            >
                                <Shapes className="h-7 w-7" />
                            </Button>
                            <span className={cn(
                                "text-xs font-medium text-muted-foreground whitespace-normal text-center",
                                selectedId === 'all' && "text-primary"
                            )}>
                                Todos
                            </span>
                        </div>
                    </CarouselItem>

                    {/* Group buttons */}
                    {groups.map(group => (
                        <CarouselItem key={group.id} className="pl-6 basis-auto">
                            <div 
                                className="flex flex-col items-center gap-2 cursor-pointer w-16"
                                onClick={() => onSelect(group.id)}
                                aria-label={`Filtrar por ${group.name}`}
                            >
                                <Button
                                    variant={selectedId === group.id ? 'default' : 'outline'}
                                    size="icon"
                                    className="h-16 w-16 rounded-full shadow-md"
                                >
                                    <CategoryIcon categoryName={group.name} className="h-7 w-7" />
                                </Button>
                                <span className={cn(
                                    "text-xs font-medium text-muted-foreground whitespace-normal text-center",
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
