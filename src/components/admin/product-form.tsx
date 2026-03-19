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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct, ProductPayload, ProductPayloadSchema } from '@/firebase/products';
import type { Product, ProductGroup } from '@/lib/data/products';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { type WithId } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


type ProductFormProps = {
  product: WithId<Product> | null;
  parentGroup: ProductGroup;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
};

const GERAL_SUBGROUP_VALUE = '__GERAL__';

export function ProductForm({ product, parentGroup, onOpenChange, onFormSubmit }: ProductFormProps) {
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof ProductPayloadSchema>>({
    resolver: zodResolver(ProductPayloadSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? '',
      stock: product?.stock ?? 0,
      groupId: product?.groupId ?? parentGroup.id,
      isActive: product?.isActive ?? true,
      subgroup: product?.subgroup || GERAL_SUBGROUP_VALUE,
      manageStock: product?.manageStock ?? true,
    },
  });

  const manageStock = form.watch('manageStock');
  const imageUrlValue = form.watch('imageUrl');

  const onSubmit = async (data: z.infer<typeof ProductPayloadSchema>) => {
    setIsSaving(true);
    try {
      const payload: ProductPayload = {
        ...data,
        imageUrl: data.imageUrl || '',
        subgroup: data.subgroup === GERAL_SUBGROUP_VALUE ? '' : data.subgroup,
      };

      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }

      toast({
        title: 'Sucesso!',
        description: product ? 'Produto atualizado.' : 'Novo produto adicionado.',
      });
      onFormSubmit();

    } catch (error) {
      console.error('Save product error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o produto.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            Insira o link da imagem e preencha os detalhes do produto. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <ScrollArea className="max-h-[70vh] pr-6">
                    <fieldset disabled={isSaving} className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL da Imagem do Produto</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://.../imagem.jpg" {...field} />
                                </FormControl>
                                <div className="mt-4 flex h-[232px] items-center justify-center rounded-lg border bg-muted p-4">
                                    {imageUrlValue ? (
                                        <Image 
                                            src={imageUrlValue} 
                                            alt="Pré-visualização do produto" 
                                            width={200}
                                            height={200}
                                            className="aspect-square rounded-md object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground">
                                            <p>Pré-visualização da imagem</p>
                                        </div>
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                          name="subgroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subgrupo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um subgrupo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={GERAL_SUBGROUP_VALUE}>Geral</SelectItem>
                                  {parentGroup.subgroups?.map((sub) => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Gerencie os subgrupos na tela de edição do grupo.
                              </FormDescription>
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
                                <Input type="number" step="0.01" {...field} onChange={e => {
                                    const value = parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? '' : value);
                                }} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <Separator className="my-2" />
                        
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Produto Ativo</FormLabel>
                                <FormDescription>
                                  Se desativado, o produto não aparecerá na loja.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="manageStock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Gerenciar Estoque</FormLabel>
                                <FormDescription>
                                  Se ativado, a quantidade será controlada.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {manageStock && (
                            <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Quantidade em Estoque</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => {
                                        const value = parseInt(e.target.value, 10);
                                        field.onChange(isNaN(value) ? '' : value);
                                    }}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                    </fieldset>
                </ScrollArea>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
