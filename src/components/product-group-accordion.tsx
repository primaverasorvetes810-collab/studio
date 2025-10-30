'use client';

import type { ProductGroup } from '@/lib/data/products';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProductGrid } from '@/components/product-grid';

type ProductGroupAccordionProps = {
  productGroups: ProductGroup[];
};

export function ProductGroupAccordion({
  productGroups,
}: ProductGroupAccordionProps) {
  if (!productGroups || productGroups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">
          Nenhuma categoria de produtos disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {productGroups.map((group) => (
        <AccordionItem value={group.id} key={group.id} className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
            {group.name}
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             <p className="text-muted-foreground mb-6">{group.description}</p>
            <ProductGrid groupId={group.id} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
