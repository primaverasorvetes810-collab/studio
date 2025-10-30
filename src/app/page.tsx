'use client';

import PageHeader from '@/components/page-header';
import { ProductGrid } from '@/components/product-grid';
import { useCollection, useFirestore } from '@/firebase';
import type { Product } from '@/lib/data/products';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

export default function Home() {
  const firestore = useFirestore();
  
  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery as any);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Nossos Produtos"
        description="Navegue pela nossa seleção de itens deliciosos."
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ProductGrid initialProducts={products || []} />
      )}
    </div>
  );
}
