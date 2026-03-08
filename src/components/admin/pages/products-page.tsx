'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase, useCollection, type WithId } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, ProductGroup } from '@/lib/data/products';
import { ProductGroupManager } from '../product-group-manager';
import { ProductForm } from '../product-form';
import { useToast } from '@/hooks/use-toast';
import { createProduct, updateProduct, type ProductPayload } from '@/firebase/products';

const GERAL_SUBGROUP_VALUE = '__GERAL__';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WithId<Product> | null>(null);
  const [activeGroup, setActiveGroup] = useState<ProductGroup | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>('');

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  // useCollection's onSnapshot listener will handle all UI updates automatically.
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
    // If the form is closing, reset the editing state.
    if (!open) {
      setEditingProduct(null);
      setActiveGroup(null);
    }
  };

  const handleInitiateSave = async (data: ProductPayload) => {
    if (data.groupId && openAccordion !== data.groupId) {
      setOpenAccordion(data.groupId);
    }

    try {
      const payload: ProductPayload = {
        ...data,
        subgroup: data.subgroup === GERAL_SUBGROUP_VALUE ? '' : data.subgroup,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast({ title: 'Sucesso!', description: 'Produto atualizado.' });
      } else {
        await createProduct(payload);
        toast({ title: 'Sucesso!', description: 'Novo produto adicionado.' });
      }

    } catch (error) {
      console.error('Save product error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o produto.',
      });
    }
  };


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
          onInitiateSave={handleInitiateSave}
        />
      )}
    </>
  );
}
