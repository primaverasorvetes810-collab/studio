'use client';

import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product, ProductGroup } from '@/lib/data/products';
import { collection } from 'firebase/firestore';
import {
  PlusCircle,
  Loader2,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
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
import {
  deleteProduct,
} from '@/firebase/products';
import { ProductForm } from '@/components/product-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductGroupForm } from '@/components/product-group-form';
import { deleteProductGroup } from '@/firebase/product-groups';
import AdminProductList from '@/components/admin-product-list';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function ProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  // State for managing dialogs and selected items
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ProductGroup | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  // Fetch product groups
  const productGroupsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'productGroups');
  }, [firestore]);
  const { data: productGroups, isLoading: areGroupsLoading } =
    useCollection<ProductGroup>(productGroupsQuery);

  // Handlers for Groups
  const handleAddNewGroup = () => {
    setSelectedGroup(null);
    setGroupFormOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setSelectedGroup(group);
    setGroupFormOpen(true);
  };

  const handleDeleteGroupClick = (group: ProductGroup) => {
    setGroupToDelete(group);
  };

  const handleDeleteGroupConfirm = () => {
    if (groupToDelete) {
      deleteProductGroup(groupToDelete.id);
      toast({
        title: 'Grupo excluído!',
        description: `"${groupToDelete.name}" foi removido.`,
      });
    }
    setGroupToDelete(null);
  };

  // Handlers for Products
  const handleAddNewProduct = (groupId: string) => {
    setSelectedProduct(null);
    setCurrentGroupId(groupId);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentGroupId(product.groupId);
    setProductFormOpen(true);
  };

  const handleDeleteProductClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDeleteProductConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: 'Produto excluído!',
        description: `"${productToDelete.name}" foi removido do grupo.`,
      });
    }
    setProductToDelete(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Grupos de Produtos"
        description="Organize seus produtos em grupos para facilitar a navegação."
      >
        <Button onClick={handleAddNewGroup}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Grupo
        </Button>
      </PageHeader>

      {areGroupsLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : productGroups && productGroups.length > 0 ? (
        <div className="space-y-4">
          {productGroups.map((group) => (
            <Collapsible key={group.id} className="w-full">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4 transition-transform [&[data-state=open]>svg]:rotate-90" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                      <CardTitle className='text-lg'>{group.name}</CardTitle>
                    </div>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Grupo
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGroupClick(group)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Grupo
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddNewProduct(group.id)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <AdminProductList
                        groupId={group.id}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProductClick}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum grupo de produtos encontrado. Comece adicionando um!
          </CardContent>
        </Card>
      )}

      {/* Dialog for Product Form */}
      <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          {currentGroupId && (
            <ProductForm
              product={selectedProduct}
              groupId={currentGroupId}
              onSuccess={() => setProductFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Group Form */}
      <Dialog open={groupFormOpen} onOpenChange={setGroupFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup ? 'Editar Grupo' : 'Adicionar Novo Grupo'}
            </DialogTitle>
          </DialogHeader>
          <ProductGroupForm
            group={selectedGroup}
            onSuccess={() => setGroupFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Deleting Product */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente o produto{' '}
              <span className="font-semibold">"{productToDelete?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProductConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Alert Dialog for Deleting Group */}
       <AlertDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção: Todos os produtos dentro do grupo <span className="font-semibold">"{groupToDelete?.name}"</span> também serão excluídos. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroupConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, excluir grupo e seus produtos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
