'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase, useCollection, type WithId, useStorage } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, ProductGroup } from '@/lib/data/products';
import { ProductGroupManager } from '../product-group-manager';
import { ProductForm } from '../product-form';
import { useToast } from '@/hooks/use-toast';
import { createProduct, updateProduct, type ProductPayload } from '@/firebase/products';
import { uploadFileAndGetURL } from '@/firebase/storage';

const GERAL_SUBGROUP_VALUE = '__GERAL__';

export type PendingProduct = {
  tempId: string;
  data: ProductPayload;
  localImageUrl: string;
  progress: number;
};

export default function ProductsPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WithId<Product> | null>(null);
  const [activeGroup, setActiveGroup] = useState<ProductGroup | null>(null);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);

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
    setIsFormOpen(true);
  };

  const handleAddNewProduct = (group: ProductGroup) => {
    setEditingProduct(null);
    setActiveGroup(group);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    // If the form is closing, reset the editing state.
    if (!open) {
      setEditingProduct(null);
      setActiveGroup(null);
    }
  };

  const handleInitiateSave = (data: ProductPayload, imageFile: File | null) => {
    const tempId = crypto.randomUUID();
    const localImageUrl = imageFile 
      ? URL.createObjectURL(imageFile) 
      : (data.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=Imagem');

    const newPendingProduct: PendingProduct = {
      tempId,
      data,
      localImageUrl,
      progress: 0,
    };

    setPendingProducts(prev => [...prev, newPendingProduct]);

    const executeSave = async () => {
      try {
        let finalImageUrl = data.imageUrl;

        if (imageFile) {
          finalImageUrl = await uploadFileAndGetURL(
            storage,
            imageFile,
            'products',
            (progress) => {
              setPendingProducts(prev => 
                prev.map(p => p.tempId === tempId ? { ...p, progress } : p)
              );
            }
          );
        }
        
        const payload: ProductPayload = {
          ...data,
          imageUrl: finalImageUrl,
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
      } finally {
        setPendingProducts(prev => prev.filter(p => p.tempId !== tempId));
        URL.revokeObjectURL(localImageUrl);
      }
    };

    executeSave();
  };


  return (
    <>
      <div className="grid flex-1 items-start gap-8">
        <ProductGroupManager
          onAddProductClick={handleAddNewProduct}
          onEditProductClick={handleEditProduct}
          products={products}
          productGroups={productGroups}
          pendingProducts={pendingProducts}
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
