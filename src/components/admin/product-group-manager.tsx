'use client';

import type { ProductGroup } from '@/lib/data/products';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
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


export function ProductGroupManager() {
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
    
  const handleAddNew = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleEdit = (group: ProductGroup) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };
  
  const handleDelete = (group: ProductGroup) => {
    setDeletingGroup(group);
  }
  
  const confirmDelete = () => {
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
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Grupos de Produtos</CardTitle>
                <CardDescription>
                Adicione, edite ou remova grupos (categorias) de produtos.
                </CardDescription>
            </div>
            <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Adicionar Grupo
                </span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productGroups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{group.description}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon" onClick={() => handleEdit(group)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(group)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Deletar</span>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sim, deletar grupo e produtos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
