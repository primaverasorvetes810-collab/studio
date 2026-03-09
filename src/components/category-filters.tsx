'use client';

import type { ProductGroup } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { Shapes } from "lucide-react";

interface CategoryFiltersProps {
    groups: ProductGroup[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export default function CategoryFilters({ groups, selectedId, onSelect }: CategoryFiltersProps) {
    
    return (
        <div className="relative">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-6 pb-4">
                     {/* "All" button */}
                    <div 
                        className="flex flex-col items-center gap-2 cursor-pointer"
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
                            "text-sm font-medium text-muted-foreground",
                            selectedId === 'all' && "text-primary"
                        )}>
                            Todos
                        </span>
                    </div>

                    {/* Group buttons */}
                    {groups.map(group => (
                        <div 
                            key={group.id} 
                            className="flex flex-col items-center gap-2 cursor-pointer"
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
                                "text-sm font-medium text-muted-foreground truncate max-w-20",
                                selectedId === group.id && "text-primary"
                            )}>
                                {group.name}
                            </span>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
