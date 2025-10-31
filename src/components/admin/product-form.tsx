'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ProductPayloadSchema, createProduct, updateProduct } from '@/firebase/products';
import type { Product, ProductGroup } from '@/lib/data/products';

type ProductFormProps = {
  product: Product | null;
  productGroups: ProductGroup[];
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
};

export function ProductForm({ product, productGroups, onOpenChange, onFormSubmit }: ProductFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof ProductPayloadSchema>>({
    resolver: zodResolver(ProductPayloadSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      image: product?.image ?? '',
      stock: product?.stock ?? 0,
      groupId: product?.groupId ?? '',
    },
  });

  const onSubmit = (data: z.infer<typeof ProductPayloadSchema>) => {
    try {
        if (product) {
            // Update product
            updateProduct(product.id, data);
            toast({ title: "Sucesso!", description: "Produto atualizado." });
        } else {
            // Create new product
            createProduct(data);
            toast({ title: "Sucesso!", description: "Novo produto adicionado." });
        }
        onFormSubmit();
    } catch (error) {
        console.error("Form submission error:", error);
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível salvar o produto." });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do produto aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pote de Açaí 500ml" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o produto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (em R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo do Produto</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                        {productGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID da Imagem Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 'burger', 'pizza'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
