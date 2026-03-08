'use client';

import type { Product, ProductGroup } from '@/lib/data/products';
import { useMemo, useState } from 'react';
import { Loader2, Pencil, PlusCircle, Trash2, MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { formatPrice, getProductImageUrl } from '@/lib/utils';
import { deleteProduct, updateProduct } from '@/firebase/products';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { PendingProduct } from './pages/products-page';
import { PendingProductCard } from './pending-product-card';


function ProductListGrid({ group, products, pendingProducts, onEdit, onAdd }: { 
    group: ProductGroup, 
    products: Product[],
    pendingProducts: PendingProduct[],
    onEdit: (product: Product, group: ProductGroup) => void, 
    onAdd: (group: ProductGroup) => void 
}) {
  const { toast } = useToast();
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const subgroups = useMemo(() => ['Geral', ...(group.subgroups ?? [])], [group.subgroups]);
  
  const groupedProducts = useMemo(() => {
    if (!products) return {};
    return products.reduce((acc, product) => {
        const subgroup = product.subgroup || 'Geral';
        if (!acc[subgroup]) {
            acc[subgroup] = [];
        }
        acc[subgroup].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const groupedPendingProducts = useMemo(() => {
    if (!pendingProducts) return {};
    return pendingProducts.reduce((acc, product) => {
        const subgroup = product.data.subgroup === '__GERAL__' || !product.data.subgroup ? 'Geral' : product.data.subgroup;
        if (!acc[subgroup]) acc[subgroup] = [];
        acc[subgroup].push(product);
        return acc;
    }, {} as Record<string, PendingProduct[]>);
  }, [pendingProducts]);


  const handleToggleActive = (product: Product) => {
    const newStatus = !(product.isActive ?? true);
    updateProduct(product.id, { isActive: newStatus });
    toast({
        title: `Produto ${newStatus ? 'ativado' : 'desativado'}`,
    });
  };

  const confirmDeleteProduct = (product: Product) => {
    deleteProduct(product.id);
    toast({
        title: 'Produto Deletado',
        description: `O produto "${product.name}" foi deletado.`,
    });
    setDeletingProduct(null);
  }

  const hasContent = products.length > 0 || pendingProducts.length > 0;
  
  if (!hasContent) {
    return (
        <div className="w-full">
             <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum produto neste grupo.
            </div>
            <div className="flex justify-start border-t px-4 py-2">
                <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground" onClick={() => onAdd(group)}>
                    <PlusCircle className="h-4 w-4" />
                    <span>Adicionar Produto</span>
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full">
        {subgroups.map(subgroupName => {
            const currentRealProducts = groupedProducts[subgroupName] || [];
            const currentPendingProducts = groupedPendingProducts[subgroupName] || [];
            if (currentRealProducts.length === 0 && currentPendingProducts.length === 0) return null;

            return (
                <div key={subgroupName} className="border-t first:border-t-0">
                    <h4 className="px-4 pt-3 pb-2 text-sm font-semibold tracking-wider bg-muted/50">{subgroupName}</h4>
                    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {currentPendingProducts.map(p => (
                            <PendingProductCard
                                key={p.tempId}
                                name={p.data.name}
                                price={p.data.price}
                                localImageUrl={p.localImageUrl}
                                progress={p.progress}
                            />
                        ))}
                         {currentRealProducts.map((product) => (
                            <div key={product.id} className="group/item relative">
                                 <Card className="group/card flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="p-0">
                                        <div className="relative aspect-square">
                                            <Image
                                                src={getProductImageUrl(product)}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-grow flex-col p-3">
                                        <div className="flex-grow">
                                            <h3 className="mb-1 text-base font-semibold truncate">{product.name}</h3>
                                            <Badge variant={product.isActive ? 'secondary' : 'outline'} className={product.isActive ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                                                {product.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                                    </CardContent>
                                </Card>
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col gap-2">
                                    <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => onEdit(product, group)}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeletingProduct(product)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Deletar</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}

        <div className="flex justify-start border-t px-4 py-2">
             <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground" onClick={() => onAdd(group)}>
              <PlusCircle className="h-4 w-4" />
              <span>Adicionar Produto ao Grupo</span>
            </Button>
        </div>

         <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação irá deletar o produto "{deletingProduct?.name}" permanentemente. Essa ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deletingProduct && confirmDeleteProduct(deletingProduct)} className="bg-destructive hover:bg-destructive/90">Sim, deletar produto</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}

function ProductCountBadge({ count }: { count: number }) {
    return <Badge variant="secondary">{count}</Badge>;
}


export function ProductGroupManager({ onAddProductClick, onEditProductClick, products, productGroups, pendingProducts, openAccordion, onAccordionChange }: { 
    onAddProductClick: (group: ProductGroup) => void;
    onEditProductClick: (product: Product, group: ProductGroup) => void;
    products: Product[] | null;
    productGroups: ProductGroup[] | null;
    pendingProducts: PendingProduct[];
    openAccordion: string;
    onAccordionChange: (value: string) => void;
}) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ProductGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isLoading = !products || !productGroups;

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
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-1"
            value={openAccordion}
            onValueChange={onAccordionChange}
          >
            {filteredGroups.map((group) => {
                const groupProducts = products?.filter(p => p.groupId === group.id) || [];
                const groupPendingProducts = pendingProducts.filter(p => p.data.groupId === group.id);
                return (
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
                          <span className="sr-only">Ações do grupo</span>
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
                    <ProductCountBadge count={groupProducts.length} />
                  </div>
                </div>
                <AccordionContent className="p-0">
                  <div className="px-4 pb-2 border-b">
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <ProductListGrid
                    group={group}
                    products={groupProducts}
                    pendingProducts={groupPendingProducts}
                    onEdit={onEditProductClick}
                    onAdd={onAddProductClick}
                  />
                </AccordionContent>
              </AccordionItem>
            )})}
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
