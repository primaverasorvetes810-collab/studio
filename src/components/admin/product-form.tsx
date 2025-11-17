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
import type { Product } from '@/lib/data/products';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';

type ProductFormProps = {
  product: Product | null;
  groupId: string;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
};

export function ProductForm({ product, groupId, onOpenChange, onFormSubmit }: ProductFormProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);
  
  const form = useForm<z.infer<typeof ProductPayloadSchema>>({
    resolver: zodResolver(ProductPayloadSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      image: product?.image ?? '',
      stock: product?.stock ?? 0,
      groupId: product?.groupId ?? groupId, // Pre-fill with groupId
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        form.setValue('image', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


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
        <ScrollArea className="max-h-[70vh] pr-6">
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
                name="image"
                render={() => (
                    <FormItem>
                    <FormLabel>Imagem do Produto</FormLabel>
                    <FormControl>
                        <div>
                        <Input
                            id="image-upload"
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                        >
                            {preview ? (
                            <Image src={preview} alt="Pré-visualização" width={100} height={100} className="object-contain h-full p-2" />
                            ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Clique para fazer upload</span>
                                </p>
                            </div>
                            )}
                        </label>
                        </div>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
