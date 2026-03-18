'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase, useCollection, type WithId } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, ProductGroup } from '@/lib/data/products';
import { ProductGroupManager } from '../product-group-manager';
import { ProductForm } from '../product-form';

export default function ProductsPage() {
  const firestore = useFirestore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WithId<Product> | null>(null);
  const [activeGroup, setActiveGroup] = useState<ProductGroup | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>('');

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products } = useCollection<Product>(productsQuery);

  const productGroupsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productGroups') : null),
    [firestore]
  );
  const { data: productGroups } = useCollection<ProductGroup>(productGroupsQuery);

  const handleEditProduct = (product: WithId<Product>, group: ProductGroup) => {
    setEditingProduct(product);
    setActiveGroup(group);
    if (!openAccordion) {
      onAccordionChange(group.id);
    }
    setIsFormOpen(true);
  };

  const handleAddNewProduct = (group: ProductGroup) => {
    setEditingProduct(null);
    setActiveGroup(group);
    if (openAccordion !== group.id) {
      onAccordionChange(group.id);
    }
    setIsFormOpen(true);
  };

  const onAccordionChange = (value: string) => {
    setOpenAccordion(value);
  }

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingProduct(null);
      setActiveGroup(null);
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false); // Close the dialog
    // Data will be re-fetched automatically by useCollection
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-8">
        <ProductGroupManager
          onAddProductClick={handleAddNewProduct}
          onEditProductClick={handleEditProduct}
          products={products}
          productGroups={productGroups}
          openAccordion={openAccordion}
          onAccordionChange={onAccordionChange}
        />
      </div>

      {isFormOpen && activeGroup && (
        <ProductForm
          product={editingProduct}
          parentGroup={activeGroup}
          onOpenChange={handleFormOpenChange}
          onFormSubmit={handleFormSubmit}
        />
      )}
    </>
  );
}
