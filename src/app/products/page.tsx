'use client';

import { useMemo, useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Product, ProductGroup } from '@/lib/data/products';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2, ShoppingCart } from 'lucide-react';
import HomeCarousel from '@/components/home-carousel';
import { useCart } from '@/firebase/cart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPrice, formatPriceAsString } from '@/lib/utils';
import { cn } from '@/lib/utils';
import CategoryFilters from '@/components/category-filters';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { cartItems, isLoading: isCartLoading } = useCart(user?.uid);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    
    const allGroupedData = productGroups.map(group => {
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
    });

    if (selectedGroupId === 'all') {
        return allGroupedData.filter(group => group.subgroups.length > 0);
    }
    return allGroupedData.filter(group => group.id === selectedGroupId && group.subgroups.length > 0);

  }, [productGroups, allProducts, selectedGroupId]);

  const isLoading = isLoadingGroups || isLoadingProducts;
  
  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cartItems]);


  return (
    <div className="pb-32">
      <HomeCarousel />
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {productGroups && productGroups.length > 0 && (
          <CategoryFilters
            groups={productGroups}
            selectedId={selectedGroupId}
            onSelect={setSelectedGroupId}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-12">
            {groupedData.length > 0 ? (
              groupedData.map((group) => (
                <section key={group.id} aria-labelledby={`group-title-${group.id}`}>
                  <h2 id={`group-title-${group.id}`} className="text-xl font-bold tracking-tight border-b-2 border-primary pb-2 mb-4">{group.name}</h2>
                  {group.description && <p className="text-sm text-muted-foreground mb-8">{group.description}</p>}
                  <div className="space-y-8">
                    {group.subgroups.map(subgroup => (
                      <div key={subgroup.name} aria-labelledby={`subgroup-title-${group.id}-${subgroup.name}`}>
                        <h3 id={`subgroup-title-${group.id}-${subgroup.name}`} className="text-lg font-semibold mb-4 text-muted-foreground">{subgroup.name}</h3>
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
                  <p>{selectedGroupId === 'all' ? 'Nenhum produto disponível no momento.' : 'Nenhum produto encontrado para esta categoria.'}</p>
               </div>
            )}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-12">
        <div className="container mx-auto max-w-2xl">
            <Button
              asChild
              className={cn(
                "w-full font-bold shadow-2xl shadow-primary/30 flex justify-between items-center animate-pulse-deep",
                "h-14 px-4 text-xl rounded-lg",
                "sm:h-16 sm:px-6 sm:text-2xl"
              )}
            >
              <Link href="/cart">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                    {totalItems > 0 ? (
                        <span>Ver Carrinho ({totalItems})</span>
                    ) : (
                        <span>Finalize seu Pedido</span>
                    )}
                  </div>
                  <span>{isMounted ? formatPrice(subtotal) : formatPriceAsString(subtotal)}</span>
              </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
