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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle } from 'lucide-react';
import { ProductGroupAccordion } from '@/components/product-group-accordion';
import { ProductForm } from '@/components/admin/product-form';

export default function ProductsPage() {
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productGroupsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'productGroups') : null),
    [firestore]
  );
  const { data: productGroups, isLoading: isLoadingGroups } =
    useCollection<ProductGroup>(productGroupsQuery);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filtro
                </span>
              </Button>
              <Button size="sm" className="h-7 gap-1" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Adicionar Produto
                </span>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>
                  Gerencie os produtos da sua loja. Adicione, edite ou remova produtos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingGroups ? (
                    <p>Carregando grupos...</p>
                 ) : (
                    <ProductGroupAccordion productGroups={productGroups || []} />
                 )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {isFormOpen && (
         <ProductForm 
            product={editingProduct}
            productGroups={productGroups || []} 
            onOpenChange={setIsFormOpen}
            onFormSubmit={handleFormClose}
        />
      )}
    </>
  );
}
