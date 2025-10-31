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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatPrice } from '@/lib/utils';
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

export default function ProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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

  const getGroupName = (groupId: string) => {
    return productGroups?.find((g) => g.id === groupId)?.name || 'N/A';
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
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
  };

  return (
    <>
      <div className="grid flex-1 items-start gap-8">
        
        {/* Gerenciador de Grupos */}
        <ProductGroupManager />

        {/* Gerenciador de Produtos */}
        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>
                    Gerencie os produtos individuais da sua loja.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtro
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Produto
                        </span>
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Imagem</span>
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead className="hidden md:table-cell">Preço</TableHead>
                  <TableHead className="hidden md:table-cell">Estoque</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => {
                  const placeholder = PlaceHolderImages.find((p) => p.id === product.image);
                  const imageUrl = product.image.startsWith('data:image') ? product.image : placeholder?.imageUrl;

                  return (
                    <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                             {imageUrl && (
                                <Image
                                    alt={product.name}
                                    className="aspect-square rounded-md object-cover"
                                    height="64"
                                    src={imageUrl}
                                    width="64"
                                />
                             )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{getGroupName(product.groupId)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatPrice(product.price)}</TableCell>
                        <TableCell className="hidden md:table-cell">{product.stock} unidades</TableCell>
                        <TableCell>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          productGroups={productGroups || []}
          onOpenChange={setIsFormOpen}
          onFormSubmit={handleFormClose}
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
