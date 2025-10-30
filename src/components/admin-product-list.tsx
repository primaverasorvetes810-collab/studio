'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/data/products';
import { collection, query, where } from 'firebase/firestore';
import { formatPrice } from '@/lib/utils';

interface AdminProductListProps {
  groupId: string;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export default function AdminProductList({
  groupId,
  onEditProduct,
  onDeleteProduct,
}: AdminProductListProps) {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !groupId) return null;
    return query(
      collection(firestore, 'products'),
      where('groupId', '==', groupId)
    );
  }, [firestore, groupId]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Nenhum produto neste grupo ainda.
      </div>
    );
  }

  return (
    <div className="border-t">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>
                <span className="sr-only">Ações</span>
            </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {products.map((product) => (
            <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                <Badge
                    variant={product.stock > 0 ? 'outline' : 'destructive'}
                    className={
                    product.stock > 0 ? 'border-green-500 text-green-500' : ''
                    }
                >
                    {product.stock > 0 ? 'Em Estoque' : 'Fora de Estoque'}
                </Badge>
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Alternar menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEditProduct(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeleteProduct(product)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
