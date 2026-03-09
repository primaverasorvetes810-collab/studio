'use client';

import { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product, ProductGroup } from '@/lib/data/products';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import HomeCarousel from '@/components/home-carousel';
import CategoryFilters from '@/components/category-filters';

export default function ProductsPage() {
  const firestore = useFirestore();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  const productGroupsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'productGroups'), orderBy('name', 'asc'));
  }, [firestore]);
  const { data: productGroups, isLoading: isLoadingGroups } = useCollection<ProductGroup>(productGroupsQuery);
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('isActive', '==', true));
  }, [firestore]);
  const { data: allProducts, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (selectedGroupId === 'all') {
      // Simple shuffle for "randomness" effect on each load/filter
      return [...allProducts].sort(() => Math.random() - 0.5);
    }
    return allProducts.filter((product) => product.groupId === selectedGroupId);
  }, [allProducts, selectedGroupId]);

  const isLoading = isLoadingGroups || isLoadingProducts;

  return (
    <div className="container mx-auto px-4 py-8">
      <HomeCarousel />
      <div className="my-8">
        <PageHeader
          title="Nossos Produtos"
          description="Navegue por nossas categorias e encontre o que deseja."
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <CategoryFilters 
            groups={productGroups || []}
            selectedId={selectedGroupId}
            onSelect={setSelectedGroupId}
          />
          {filteredProducts.length > 0 ? (
             <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
          ) : (
             <div className="mt-12 text-center text-muted-foreground">
                <p>Nenhum produto encontrado nesta categoria.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
}
