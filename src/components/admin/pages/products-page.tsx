'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase, useCollection, type WithId } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, ProductGroup } from '@/lib/data/products';
import { useToast } from '@/hooks/use-toast';
import { ProductGroupManager } from '../product-group-manager';
import { ProductForm } from '../product-form';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeGroup, setActiveGroup] = useState<ProductGroup | null>(null);

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, setData: setProducts } = useCollection<Product>(productsQuery);

  const productGroupsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productGroups') : null),
    [firestore]
  );
  const { data: productGroups } = useCollection<ProductGroup>(productGroupsQuery);

  const handleEditProduct = (product: Product, group: ProductGroup) => {
    setEditingProduct(product);
    setActiveGroup(group);
    setIsFormOpen(true);
  };

  const handleAddNewProduct = (group: ProductGroup) => {
    setEditingProduct(null);
    setActiveGroup(group);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setActiveGroup(null);
  };
  
  const handleFormSubmit = (optimisticProduct: WithId<Product>) => {
    if (!products || !setProducts) return;

    const productExists = products.some(p => p.id === optimisticProduct.id);

    if (productExists) {
      // It's an update, replace the item
      setProducts(prevProducts => 
        prevProducts?.map(p => p.id === optimisticProduct.id ? optimisticProduct : p) || null
      );
    } else {
      // It's a new product, add it to the list
      setProducts(prevProducts => [optimisticProduct, ...(prevProducts || [])]);
    }
    
    // Close the form after optimistic update
    handleFormClose();
  };

  return (
    <>
      <div className="grid flex-1 items-start gap-8">
        <ProductGroupManager
          onAddProductClick={handleAddNewProduct}
          onEditProductClick={handleEditProduct}
          products={products}
          productGroups={productGroups}
        />
      </div>

      {isFormOpen && activeGroup && (
        <ProductForm
          product={editingProduct}
          parentGroup={activeGroup}
          onOpenChange={setIsFormOpen}
          onFormSubmit={handleFormSubmit}
        />
      )}
    </>
  );
}
