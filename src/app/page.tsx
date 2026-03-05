
'use client';

import HomeCarousel from '@/components/home-carousel';
import PageHeader from '@/components/page-header';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product, ProductGroup } from '@/lib/data/products';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { ProductCarousel } from '@/components/product-carousel';

export default function Home() {
  const firestore = useFirestore();

  // Fetch Product Groups
  const productGroupsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'productGroups');
  }, [firestore]);
  const { data: productGroups, isLoading: areGroupsLoading } =
    useCollection<ProductGroup>(productGroupsQuery);

  // Fetch all active Products
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), where('isActive', '!=', false));
  }, [firestore]);
  const { data: products, isLoading: areProductsLoading } =
    useCollection<Product>(productsQuery);

  const isLoading = areGroupsLoading || areProductsLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <HomeCarousel />
      <div className="my-8">
        <PageHeader
          title="Faça seu pedido agora mesmo"
          description="Navegue por nossas categorias e escolha seus itens favoritos."
        />
      </div>
      <div className="mt-8 space-y-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          productGroups &&
          products &&
          productGroups.map((group) => (
            <ProductCarousel key={group.id} group={group} products={products} />
          ))
        )}
      </div>
    </div>
  );
}
