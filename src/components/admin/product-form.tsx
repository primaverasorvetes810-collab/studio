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
import { ProductPayload, ProductPayloadSchema } from '@/firebase/products';
import type { Product, ProductGroup } from '@/lib/data/products';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { type WithId } from '@/firebase';
import { UploadCloud, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Progress } from '@/components/ui/progress';

type ProductFormProps = {
  product: WithId<Product> | null;
  parentGroup: ProductGroup;
  onOpenChange: (open: boolean) => void;
  onInitiateSave: (data: ProductPayload, imageFile: File | null) => void;
};

const GERAL_SUBGROUP_VALUE = '__GERAL__';

export function ProductForm({ product, parentGroup, onOpenChange, onInitiateSave }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof ProductPayloadSchema>>({
    resolver: zodResolver(ProductPayloadSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? undefined,
      stock: product?.stock ?? 0,
      groupId: product?.groupId ?? parentGroup.id,
      isActive: product?.isActive ?? true,
      subgroup: product?.subgroup || GERAL_SUBGROUP_VALUE,
      manageStock: product?.manageStock ?? true,
    },
  });

  const manageStock = form.watch('manageStock');
  const imageUrlValue = form.watch('imageUrl');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      const tempUrl = URL.createObjectURL(compressedFile);
      form.setValue('imageUrl', tempUrl, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      console.error("Image compression error:", error);
      setImageFile(file); // Fallback to original file
      const tempUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', tempUrl, { shouldValidate: true, shouldDirty: true });
    } finally {
      setIsCompressing(false);
    }
  };

  const onSubmit = (data: z.infer<typeof ProductPayloadSchema>) => {
    setIsSaving(true);
    onInitiateSave(data, imageFile);
    onOpenChange(false);
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
                    <fieldset disabled={isCompressing || isSaving} className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Imagem do Produto (Opcional)</FormLabel>
                                  <div className="flex flex-col gap-4">
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/png, image/jpeg, image/gif, image/webp"
                                        />
                                    </FormControl>
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        {isCompressing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                        {isCompressing ? 'Otimizando...' : (imageUrlValue ? 'Trocar Imagem' : 'Enviar Imagem')}
                                    </Button>
                                  </div>
                                  <FormDescription>
                                      A imagem é opcional, mas recomendada. Use a proporção 1:1 (ex: 800x800 pixels).
                                  </FormDescription>
                                  <FormMessage />
                                  <div className="mt-4 flex h-[232px] items-center justify-center rounded-lg border bg-muted p-4">
                                    {isCompressing ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    ) : imageUrlValue ? (
                                        <Image 
                                            src={imageUrlValue} 
                                            alt="Pré-visualização da imagem" 
                                            width={200}
                                            height={200}
                                            className="aspect-square rounded-md object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground">
                                            <UploadCloud className="mx-auto mb-2 h-8 w-8" />
                                            <p>Pré-visualização da imagem</p>
                                        </div>
                                    )}
                                </div>
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
                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                    </fieldset>
                </ScrollArea>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCompressing || isSaving}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isCompressing || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
