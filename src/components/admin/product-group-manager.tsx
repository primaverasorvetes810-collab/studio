

'use client';

import type { Product, ProductGroup } from '@/lib/data/products';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, Pencil, PlusCircle, Trash2, MoreVertical, Search } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Input } from '../ui/input';


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

  return (
    <div className="w-full">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[64px] sm:table-cell px-2 py-2">Imagem</TableHead>
                <TableHead className="px-2 py-2">Nome</TableHead>
                <TableHead className='hidden md:table-cell px-2 py-2'>Preço</TableHead>
                <TableHead className='hidden md:table-cell px-2 py-2'>Estoque</TableHead>
                <TableHead className="px-2 py-2"><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products && products.length > 0 ? products.map((product) => {
                const placeholder = PlaceHolderImages.find((p) => p.id === product.image);
                const imageUrl = product.image.startsWith('data:image') ? product.image : placeholder?.imageUrl;
                return (
                    <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell px-2 py-2">
                        {imageUrl && (
                        <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="40"
                            src={imageUrl}
                            width="40"
                        />
                        )}
                    </TableCell>
                    <TableCell className="font-medium px-2 py-2">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell px-2 py-2">{formatPrice(product.price)}</TableCell>
                    <TableCell className="hidden md:table-cell px-2 py-2">{product.stock} un.</TableCell>
                    <TableCell className="px-2 py-2">
                        <div className="flex justify-end">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(product)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeletingProduct(product)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TableCell>
                    </TableRow>
                )
                }) : (
                     <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                            Nenhum produto neste grupo.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>

        <div className="flex justify-start border-t px-4 py-2">
             <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground" onClick={onAdd}>
              <PlusCircle className="h-4 w-4" />
              <span className="sm:whitespace-nowrap">
                Adicionar Produto
              </span>
            </Button>
        </div>

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

function ProductCountBadge({ groupId }: { groupId: string }) {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(
      () => (firestore ? query(collection(firestore, 'products'), where('groupId', '==', groupId)) : null),
      [firestore, groupId]
    );
    const { data: products } = useCollection<Product>(productsQuery);
    return <Badge variant="secondary">{products?.length || 0}</Badge>;
}


export function ProductGroupManager({ onAddProductClick, onEditProductClick }: { onAddProductClick: () => void, onEditProductClick: (product: Product) => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ProductGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const productGroupsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productGroups') : null),
    [firestore]
  );
  const { data: productGroups, isLoading, setData: setProductGroups } =
    useCollection<ProductGroup>(productGroupsQuery);
    
  const filteredGroups = useMemo(() => {
    if (!productGroups) return [];
    return productGroups.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [productGroups, searchTerm]);

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
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGroup(null);
  };

  return (
    <Card>
      <CardHeader className="p-4 space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Produtos e Grupos</CardTitle>
            <CardDescription>Gerencie seus produtos e grupos.</CardDescription>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button size="sm" className="h-8 gap-1" onClick={handleAddNewGroup}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Adicionar Grupo
              </span>
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por grupo..."
            className="w-full pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-1">
            {filteredGroups.map((group) => (
              <AccordionItem
                value={group.id}
                key={group.id}
                className="border rounded-lg bg-muted/20"
              >
                <div className="flex items-center justify-between w-full pr-2 pl-4">
                  <AccordionTrigger className="flex-1 py-2 text-md font-semibold hover:no-underline [&[data-state=open]>svg]:-rotate-90">
                    <span className="truncate text-left">{group.name}</span>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar Grupo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar Grupo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ProductCountBadge groupId={group.id} />
                  </div>
                </div>
                <AccordionContent className="p-0">
                  <div className="px-4 pb-2 border-b">
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <ProductListForGroup
                    groupId={group.id}
                    onEdit={onEditProductClick}
                    onAdd={onAddProductClick}
                  />
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

      <AlertDialog
        open={!!deletingGroup}
        onOpenChange={() => setDeletingGroup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção: deletar o grupo "{deletingGroup?.name}" também irá
              deletar permanentemente **todos os produtos** associados a ele.
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroup}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, deletar grupo e produtos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
