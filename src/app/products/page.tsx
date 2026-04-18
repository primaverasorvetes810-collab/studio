'use client';

import { useMemo, useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Product, ProductGroup } from '@/lib/data/products';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2, ShoppingCart, Search } from 'lucide-react';
import HomeCarousel from '@/components/home-carousel';
import { useCart } from '@/firebase/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { formatPrice, formatPriceAsString } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { cartItems, isLoading: isCartLoading } = useCart(user?.uid);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // 2. Process data: Filter products by search, then create a nested structure
  const filteredAndGroupedData = useMemo(() => {
    if (!productGroups || !allProducts) return [];

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const searchedProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(lowercasedSearchTerm)
    );

    if (searchTerm && searchedProducts.length === 0) return [];

    const allGroupedData = productGroups.map(group => {
      const groupProducts = searchedProducts.filter(p => p.groupId === group.id);
      
      if (groupProducts.length === 0) {
        return null;
      }

      const productsBySubgroup = groupProducts.reduce((acc, product) => {
        const subgroupName = product.subgroup || 'Geral';
        if (!acc[subgroupName]) {
          acc[subgroupName] = [];
        }
        acc[subgroupName].push(product);
        return acc;
      }, {} as Record<string, Product[]>);

      const definedSubgroups = group.subgroups?.filter(s => s !== 'Geral') || [];
      const subgroupOrder = ['Geral', ...definedSubgroups.sort()];
      
      const orderedSubgroups = subgroupOrder.map(subgroupName => ({
          name: subgroupName,
          products: productsBySubgroup[subgroupName] || [],
      })).filter(sub => sub.products.length > 0);

      if (orderedSubgroups.length === 0) {
        return null;
      }

      return {
        ...group,
        subgroups: orderedSubgroups,
      };
    }).filter((g): g is ProductGroup & { subgroups: { name: string; products: Product[] }[] } => g !== null);

    return allGroupedData;
  }, [productGroups, allProducts, searchTerm]);

  const isLoading = isLoadingGroups || isLoadingProducts;
  
  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cartItems]);

  return (
    <div className="pb-32">
      <HomeCarousel />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <Input
          type="search"
          placeholder="O que você procura?"
          className="w-full pl-12 h-12 text-base rounded-none border-x-0 border-t-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="container mx-auto px-4 pt-4 space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-12">
            {filteredAndGroupedData.length > 0 ? (
              filteredAndGroupedData.map((group) => (
                <section key={group.id} aria-labelledby={`group-title-${group.id}`}>
                  <h2 id={`group-title-${group.id}`} className="text-lg font-bold tracking-tight mb-2">{group.name}</h2>
                  <div className="space-y-8">
                    {group.subgroups.map(subgroup => (
                      <div key={subgroup.name} aria-labelledby={`subgroup-title-${group.id}-${subgroup.name}`}>
                        <h3 id={`subgroup-title-${group.id}-${subgroup.name}`} className="text-sm font-semibold mb-2 text-muted-foreground">{subgroup.name}</h3>
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
                  <p>{searchTerm ? `Nenhum resultado para "${searchTerm}".` : 'Nenhum produto disponível no momento.'}</p>
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
