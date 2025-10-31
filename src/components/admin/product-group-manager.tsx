
'use client';

import type { Product, ProductGroup } from '@/lib/data/products';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductGroupForm } from './product-group-form';
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
import { deleteProductGroup } from '@/firebase/product-groups';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatPrice } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { deleteProduct } from '@/firebase/products';


function ProductListForGroup({ groupId, onEdit, onAdd }: { groupId: string, onEdit: (product: Product) => void, onAdd: () => void }) {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), where('groupId', '==', groupId)) : null),
    [firestore, groupId]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);
  const { toast } = useToast();
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const confirmDeleteProduct = (product: Product) => {
    deleteProduct(product.id);
    toast({
        title: 'Produto Deletado',
        description: `O produto "${product.name}" foi deletado.`,
    });
    setDeletingProduct(null);
  }

  if (isLoading) return <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!products || products.length === 0) {
    return (
        <div className="px-4 py-4 text-center border-t">
             <p className="text-sm text-muted-foreground mb-4">Nenhum produto neste grupo.</p>
        </div>
    );
  }

  return (
    <div className="w-full">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[80px] sm:table-cell">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className='hidden md:table-cell'>Preço</TableHead>
                <TableHead className='hidden md:table-cell'>Estoque</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => {
                const placeholder = PlaceHolderImages.find((p) => p.id === product.image);
                const imageUrl = product.image.startsWith('data:image') ? product.image : placeholder?.imageUrl;
                return (
                    <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                        {imageUrl && (
                        <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="48"
                            src={imageUrl}
                            width="48"
                        />
                        )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatPrice(product.price)}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.stock} un.</TableCell>
                    <TableCell>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingProduct(product)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                )
                })}
            </TableBody>
        </Table>

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
                <AlertDialogAction onClick={() => deletingProduct && confirmDeleteProduct(deletingProduct)} className="bg-destructive hover:bg-destructive/90">
                Sim, deletar produto
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}


export function ProductGroupManager({ onAddProductClick, onEditProductClick }: { onAddProductClick: () => void, onEditProductClick: (product: Product) => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ProductGroup | null>(null);

  const productGroupsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productGroups') : null),
    [firestore]
  );
  const { data: productGroups, isLoading, setData: setProductGroups } =
    useCollection<ProductGroup>(productGroupsQuery);
    
  const handleAddNewGroup = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };
  
  const handleDeleteGroup = (group: ProductGroup) => {
    setDeletingGroup(group);
  }
  
  const confirmDeleteGroup = () => {
    if (!deletingGroup) return;

    deleteProductGroup(deletingGroup.id);
    toast({
        title: 'Grupo Deletado',
        description: `O grupo "${deletingGroup.name}" e todos os seus produtos foram deletados.`,
    });
    // Optimistic update
    if (productGroups) {
        setProductGroups(productGroups.filter(g => g.id !== deletingGroup.id));
    }
    setDeletingGroup(null);
  }

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGroup(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
                <CardTitle>Produtos e Grupos</CardTitle>
                <CardDescription>
                Gerencie seus produtos dentro de seus respectivos grupos.
                </CardDescription>
            </div>
            <div className='flex gap-2'>
                <Button size="sm" className="h-8 gap-1" onClick={handleAddNewGroup}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Novo Grupo
                    </span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
            <Accordion type="single" collapsible className="w-full space-y-2">
            {productGroups?.map((group) => (
                <AccordionItem value={group.id} key={group.id} className="border rounded-lg bg-muted/20">
                  <div className='flex items-center w-full px-4 py-1'>
                    <AccordionTrigger className="flex-1 py-2 text-md font-semibold hover:no-underline">
                        <span>{group.name}</span>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2 pl-4">
                          <Button variant="ghost" size="icon" className='h-8 w-8' onClick={(e) => { e.stopPropagation(); handleEditGroup(group)}}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar Grupo</span>
                        </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group)}}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Deletar Grupo</span>
                        </Button>
                    </div>
                  </div>
                <AccordionContent className="p-0">
                    <div className='px-4 pb-4 border-b flex justify-between items-start'>
                        <p className='text-sm text-muted-foreground pt-1'>{group.description}</p>
                         <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onAddProductClick}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Novo Produto
                            </span>
                        </Button>
                    </div>
                    <ProductListForGroup groupId={group.id} onEdit={onEditProductClick} onAdd={onAddProductClick} />
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}
      </CardContent>

      {isFormOpen && (
        <ProductGroupForm
          group={editingGroup}
          onOpenChange={setIsFormOpen}
          onFormSubmit={handleFormClose}
        />
      )}

      <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção: deletar o grupo "{deletingGroup?.name}" também irá deletar
              permanentemente **todos os produtos** associados a ele. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGroup} className="bg-destructive hover:bg-destructive/90">
              Sim, deletar grupo e produtos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

    