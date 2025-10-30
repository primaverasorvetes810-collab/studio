'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/data/products';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type ProductGridProps = {
  initialProducts: Product[];
};

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = initialProducts.filter((product) =>
      product.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, initialProducts]);

  return (
    <>
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
            {initialProducts.length > 0
              ? `Nenhum produto encontrado para "${searchTerm}".`
              : 'Nenhum produto disponível no momento.'}
          </p>
        </div>
      )}
    </>
  );
}
