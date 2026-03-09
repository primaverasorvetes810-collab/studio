'use client';

import PageHeader from '@/components/page-header';
import { ProductGroupAccordion } from '@/components/product-group-accordion';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { ProductGroup } from '@/lib/data/products';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import HomeCarousel from '@/components/home-carousel';

export default function ProductsPage() {
  const firestore = useFirestore();

  // Fetch Product Groups sorted by name
  const productGroupsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'productGroups'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: productGroups, isLoading } = useCollection<ProductGroup>(productGroupsQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      <HomeCarousel />
      <div className="my-8">
        <PageHeader
          title="Nossos Produtos"
          description="Navegue por nossas categorias e encontre o que deseja."
        />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductGroupAccordion productGroups={productGroups || []} />
        )}
      </div>
    </div>
  );
}
