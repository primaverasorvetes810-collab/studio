'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product, ProductGroup } from '@/lib/data/products';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type ProductGridProps = {
  group: ProductGroup;
};

export function ProductGrid({ group }: ProductGridProps) {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !group.id) return null;
    return query(collection(firestore, 'products'), where('groupId', '==', group.id));
  }, [firestore, group.id]);

  const { data: initialProducts, isLoading } = useCollection<Product>(productsQuery);

  const groupedAndFilteredProducts = useMemo(() => {
    if (!initialProducts) return {};

    const lowercasedFilter = searchTerm.toLowerCase();
    
    const filtered = initialProducts.filter(
      (product) =>
        product.isActive !== false &&
        product.name.toLowerCase().includes(lowercasedFilter)
    );

    return filtered.reduce((acc, product) => {
        const subgroup = product.subgroup || 'Geral';
        if (!acc[subgroup]) {
            acc[subgroup] = [];
        }
        acc[subgroup].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

  }, [searchTerm, initialProducts]);

  const displaySubgroups = useMemo(() => {
    const subgroupOrder = ['Geral', ...(group.subgroups ?? [])];
    return subgroupOrder.filter(subgroupName => groupedAndFilteredProducts[subgroupName]?.length > 0);
  }, [group.subgroups, groupedAndFilteredProducts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasAnyProducts = Object.keys(groupedAndFilteredProducts).length > 0 && Object.values(groupedAndFilteredProducts).some(arr => arr.length > 0);

  return (
    <>
      <div className="mb-8 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos neste grupo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {hasAnyProducts ? (
        <div className="space-y-8">
          {displaySubgroups.map((subgroupName) => (
            <div key={subgroupName}>
              <h3 className="text-xl font-semibold mb-4">{subgroupName}</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedAndFilteredProducts[subgroupName].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            {initialProducts && initialProducts.length > 0
              ? `Nenhum produto encontrado para "${searchTerm}".`
              : 'Nenhum produto disponível neste grupo.'}
          </p>
        </div>
      )}
    </>
  );
}
