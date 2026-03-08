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
import { useStorage, type WithId } from '@/firebase';
import { uploadFileAndGetURL } from '@/firebase/storage';
import { UploadCloud, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

type ProductFormProps = {
  product: WithId<Product> | null;
  parentGroup: ProductGroup;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
  setProducts: React.Dispatch<React.SetStateAction<WithId<Product>[] | null>>;
};

const GERAL_SUBGROUP_VALUE = '__GERAL__';

export function ProductForm({ product, parentGroup, onOpenChange, onFormSubmit, setProducts }: ProductFormProps) {
  const { toast } = useToast();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const { id: toastId, update } = toast({
      title: 'Otimizando imagem...',
      description: 'Isso leva apenas um instante.',
    });
    
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
      update({ id: toastId, title: 'Imagem pronta!', description: 'A imagem foi otimizada para o envio.' });
    } catch (error) {
      console.error("Image compression error:", error);
      setImageFile(file); // Fallback to original file
      const tempUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', tempUrl, { shouldValidate: true, shouldDirty: true });
      update({
        id: toastId,
        variant: 'destructive',
        title: 'Falha na otimização',
        description: 'A imagem será enviada no tamanho original.',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof ProductPayloadSchema>) => {
    // Optimistically update the UI with the local blob URL for instant feedback
    if (product && imageFile && data.imageUrl.startsWith('blob:')) {
      setProducts(prevProducts => {
          if (!prevProducts) return null;
          return prevProducts.map(p =>
              p.id === product.id 
                  ? { ...p, ...data, imageUrl: data.imageUrl } 
                  : p
          );
      });
    }

    onFormSubmit(); // Close dialog immediately
    const { id: toastId, update } = toast({
        title: 'Salvando produto...',
        description: 'Aguarde enquanto processamos seu envio.',
    });

    let finalImageUrl = data.imageUrl;

    try {
      if (imageFile) {
        finalImageUrl = await uploadFileAndGetURL(
          storage,
          imageFile,
          'products',
          (progress) => update({
            id: toastId,
            title: 'Enviando imagem...',
            description: <Progress value={progress} className="w-full" />,
          })
        );
      }

      if (!finalImageUrl) {
        update({ id: toastId, variant: 'destructive', title: 'Erro', description: 'A imagem do produto é obrigatória.' });
        return;
      }
      
      update({ id: toastId, title: 'Finalizando...', description: 'Salvando informações.' });

      const payload: ProductPayload = {
        ...data,
        imageUrl: finalImageUrl,
        subgroup: data.subgroup === GERAL_SUBGROUP_VALUE ? '' : data.subgroup,
      };

      if (!payload.manageStock) {
        payload.stock = 0;
      }
      
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      
      update({ id: toastId, title: "Sucesso!", description: product ? "Produto atualizado." : "Novo produto adicionado." });

    } catch (error) {
      console.error("Form submission error:", error);
      update({ id: toastId, variant: 'destructive', title: "Erro", description: "Não foi possível salvar o produto." });
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
                                  <div className="flex flex-col gap-4">
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/png, image/jpeg, image/gif, image/webp"
                                            disabled={isCompressing}
                                        />
                                    </FormControl>
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isCompressing}>
                                        {isCompressing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                        {isCompressing ? 'Otimizando...' : (imageUrlValue ? 'Trocar Imagem' : 'Enviar Imagem')}
                                    </Button>
                                  </div>
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
                                        />
                                    </div>
                                  )}
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
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCompressing}>Cancelar</Button>
                    <Button type="submit" disabled={isCompressing}>
                        Salvar
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
