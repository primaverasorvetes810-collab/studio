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
import { useToast } from '@/hooks/use-toast';
import { ProductPayload, ProductPayloadSchema, createProduct, updateProduct } from '@/firebase/products';
import type { Product, ProductGroup } from '@/lib/data/products';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { useStorage } from '@/firebase';
import { uploadFileAndGetURL } from '@/firebase/storage';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

type ProductFormProps = {
  product: Product | null;
  parentGroup: ProductGroup;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
};

const GERAL_SUBGROUP_VALUE = '__GERAL__';

export function ProductForm({ product, parentGroup, onOpenChange, onFormSubmit }: ProductFormProps) {
  const { toast } = useToast();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      subgroup: product?.subgroup ? product.subgroup : GERAL_SUBGROUP_VALUE,
      manageStock: product?.manageStock ?? true,
    },
  });

  const manageStock = form.watch('manageStock');
  const imageUrlValue = form.watch('imageUrl');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const tempUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', tempUrl, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: z.infer<typeof ProductPayloadSchema>) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    let finalImageUrl = product?.imageUrl ?? '';

    try {
      if (imageFile) {
        finalImageUrl = await uploadFileAndGetURL(
          storage,
          imageFile,
          'products',
          (progress) => setUploadProgress(progress)
        );
      }

      if (!finalImageUrl) {
        toast({ variant: 'destructive', title: 'Erro', description: 'A imagem do produto é obrigatória.' });
        setIsSubmitting(false);
        return;
      }
      
      const payload: ProductPayload = {
        ...data,
        imageUrl: finalImageUrl,
        subgroup: data.subgroup === GERAL_SUBGROUP_VALUE ? '' : data.subgroup,
      };

      if (!payload.manageStock) {
        payload.stock = 0;
      }
      
      if (product) {
        updateProduct(product.id, payload);
        toast({ title: "Sucesso!", description: "Produto atualizado." });
      } else {
        createProduct(payload);
        toast({ title: "Sucesso!", description: "Novo produto adicionado." });
      }
      onFormSubmit();

    } catch (error) {
      console.error("Form submission error:", error);
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível salvar o produto." });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <ScrollArea className="max-h-[70vh] pr-6">
                    <div className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Imagem do Produto</FormLabel>
                                  <FormControl>
                                      <>
                                        <Input 
                                            type="file" 
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/png, image/jpeg, image/gif, image/webp"
                                            disabled={isSubmitting}
                                        />
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                                            <UploadCloud className="mr-2 h-4 w-4" />
                                            {imageFile ? 'Trocar Imagem' : 'Enviar Imagem'}
                                        </Button>
                                     </>
                                  </FormControl>
                                  <FormDescription>
                                      Recomendamos imagens quadradas na proporção 1:1 (ex: 800x800 pixels).
                                  </FormDescription>
                                  <FormMessage />
                                  {imageUrlValue && (
                                    <div className="mt-4 flex items-center justify-center rounded-lg border bg-muted p-4">
                                        <Image 
                                            src={imageUrlValue} 
                                            alt="Pré-visualização da imagem" 
                                            width={200}
                                            height={200}
                                            className="aspect-square rounded-md object-contain"
                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                        />
                                    </div>
                                  )}
                              </FormItem>
                          )}
                        />

                         {isSubmitting && uploadProgress !== null && (
                            <div className="space-y-1">
                                <Label>Progresso do Upload</Label>
                                <Progress value={uploadProgress} />
                            </div>
                        )}
                        
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Pote de Açaí 500ml" {...field} disabled={isSubmitting} />
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
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                                <Textarea placeholder="Descreva o produto..." {...field} disabled={isSubmitting}/>
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
                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting}/>
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
                                  disabled={isSubmitting}
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
                                  disabled={isSubmitting}
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
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
