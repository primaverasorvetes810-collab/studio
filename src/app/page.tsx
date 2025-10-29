'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/data/products';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => collection(firestore, 'products'),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsCollection);

  useEffect(() => {
    if (products) {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Nossos Produtos"
          description="Navegue pela nossa seleção de itens deliciosos."
        />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Nossos Produtos"
        description="Navegue pela nossa seleção de itens deliciosos."
      />
      <div className="mb-8 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            {products && products.length > 0
              ? `Nenhum produto encontrado para "${searchTerm}".`
              : 'Nenhum produto disponível no momento.'}
          </p>
        </div>
      )}
    </div>
  );
}
