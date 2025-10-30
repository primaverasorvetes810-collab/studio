'use client';

import PageHeader from '@/components/page-header';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { ProductGroup } from '@/lib/data/products';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { ProductGroupAccordion } from '@/components/product-group-accordion';

export default function Home() {
  const firestore = useFirestore();

  const productGroupsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'productGroups');
  }, [firestore]);

  const { data: productGroups, isLoading } =
    useCollection<ProductGroup>(productGroupsQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Nossos Produtos"
        description="Navegue por nossas categorias e escolha seus itens favoritos."
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ProductGroupAccordion productGroups={productGroups || []} />
      )}
    </div>
  );
}
