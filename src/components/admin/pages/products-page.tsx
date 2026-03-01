'use client';

import { useState } from 'react';
import {
  useFirestore,
  useMemoFirebase,
  useCollection,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, ProductGroup } from '@/lib/data/products';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteProduct } from '@/firebase/products';
import { ProductGroupManager } from '../product-group-manager';
import { ProductForm } from '../product-form';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [subgroupsForForm, setSubgroupsForForm] = useState<string[]>([]);

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

  const handleEditProduct = (product: Product, subgroups: string[]) => {
    setEditingProduct(product);
    setActiveGroupId(product.groupId);
    setSubgroupsForForm(subgroups);
    setIsFormOpen(true);
  };

  const handleAddNew = (groupId: string, subgroups: string[]) => {
    setEditingProduct(null);
    setActiveGroupId(groupId);
    setSubgroupsForForm(subgroups);
    setIsFormOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  }
  
  const confirmDeleteProduct = () => {
    if (!deletingProduct) return;

    deleteProduct(deletingProduct.id);
    toast({
        title: 'Produto Deletado',
        description: `O produto "${deletingProduct.name}" foi deletado.`,
    });
    // Optimistic update
    if(products) {
        setProducts(products.filter(p => p.id !== deletingProduct.id));
    }
    setDeletingProduct(null);
  }

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setActiveGroupId(null);
    setSubgroupsForForm([]);
  };

  return (
    <>
      <div className="grid flex-1 items-start gap-8">
        
        <ProductGroupManager 
          onAddProductClick={handleAddNew} 
          onEditProductClick={handleEditProduct} 
          products={products}
          productGroups={productGroups}
        />

      </div>

      {isFormOpen && activeGroupId && (
        <ProductForm
          product={editingProduct}
          groupId={activeGroupId}
          onOpenChange={setIsFormOpen}
          onFormSubmit={handleFormClose}
          subgroups={subgroupsForForm}
        />
      )}

      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação irá deletar o produto "{deletingProduct?.name}" permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              Sim, deletar produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
