'use client';

import { useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product, ProductGroup } from '@/lib/data/products';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import HomeCarousel from '@/components/home-carousel';

export default function ProductsPage() {
  const firestore = useFirestore();

  // 1. Fetch all groups and all active products once
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

  // 2. Process data: Create a nested structure Group > Subgroup > Products
  const groupedData = useMemo(() => {
    if (!productGroups || !allProducts) return [];
    
    return productGroups.map(group => {
      const groupProducts = allProducts.filter(p => p.groupId === group.id);
      
      const productsBySubgroup = groupProducts.reduce((acc, product) => {
        const subgroupName = product.subgroup || 'Geral';
        if (!acc[subgroupName]) {
          acc[subgroupName] = [];
        }
        acc[subgroupName].push(product);
        return acc;
      }, {} as Record<string, Product[]>);

      // Order subgroups: 'Geral' first, then others alphabetically from the group definition.
      const definedSubgroups = group.subgroups?.filter(s => s !== 'Geral') || [];
      const subgroupOrder = ['Geral', ...definedSubgroups.sort()];
      
      const orderedSubgroups = subgroupOrder.map(subgroupName => ({
          name: subgroupName,
          products: productsBySubgroup[subgroupName] || [],
      })).filter(sub => sub.products.length > 0);

      return {
        ...group,
        subgroups: orderedSubgroups,
      };
    }).filter(group => group.subgroups.length > 0); // Only show groups that have products

  }, [productGroups, allProducts]);

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
        <div className="space-y-12">
          {groupedData.length > 0 ? (
            groupedData.map((group) => (
              <section key={group.id} aria-labelledby={`group-title-${group.id}`}>
                <h2 id={`group-title-${group.id}`} className="text-3xl font-bold tracking-tight border-b-2 border-primary pb-2 mb-4">{group.name}</h2>
                {group.description && <p className="text-muted-foreground mb-8">{group.description}</p>}
                <div className="space-y-8">
                  {group.subgroups.map(subgroup => (
                    <div key={subgroup.name} aria-labelledby={`subgroup-title-${group.id}-${subgroup.name}`}>
                      <h3 id={`subgroup-title-${group.id}-${subgroup.name}`} className="text-xl font-semibold mb-4 text-muted-foreground">{subgroup.name}</h3>
                      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {subgroup.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
             <div className="mt-12 text-center text-muted-foreground">
                <p>Nenhum produto disponível no momento.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
