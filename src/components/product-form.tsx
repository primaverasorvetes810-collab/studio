'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/data/products';
import { createProduct, updateProduct, type ProductPayload } from '@/firebase/products';

const productSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  price: z.coerce.number().positive('O preço deve ser um número positivo.'),
  stock: z.coerce.number().int().min(0, 'O estoque não pode ser negativo.'),
  image: z.any().refine(value => value instanceof FileList && value.length > 0 || typeof value === 'string', {
    message: 'A imagem é obrigatória.',
  }),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  groupId: string; // groupId is required
  onSuccess?: () => void;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

export function ProductForm({ product, groupId, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      image: product?.image ?? '',
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    let imageDataUrl = product?.image ?? '';
    if (data.image instanceof FileList && data.image.length > 0) {
        try {
            imageDataUrl = await fileToDataUrl(data.image[0]);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao processar imagem',
                description: 'Não foi possível ler o arquivo de imagem.',
            });
            return;
        }
    }


    const payload: ProductPayload = {
      ...data,
      image: imageDataUrl,
      groupId: groupId, // Always associate with the current group
    };

    try {
      if (product) {
        // Update existing product
        await updateProduct(product.id, payload);
        toast({
          title: 'Produto atualizado!',
          description: `"${data.name}" foi atualizado com sucesso.`,
        });
      } else {
        // Create new product
        await createProduct(payload);
        toast({
          title: 'Produto criado!',
          description: `"${data.name}" foi adicionado ao grupo.`,
        });
      }
      onSuccess?.();
      form.reset(); // Reset form after successful submission
    } catch (error: any) {
        // Error is handled by the global error listener.
        // We can still show a generic toast message.
         toast({
            variant: "destructive",
            title: "Ocorreu um erro.",
            description: "Não foi possível salvar o produto. Verifique as permissões.",
         });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Hambúrguer de Picanha" {...field} />
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
                <Textarea
                  placeholder="Um delicioso hambúrguer feito com 200g de picanha..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                <FormLabel>Imagem</FormLabel>
                <FormControl>
                    <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onChange(e.target.files)}
                    {...rest}
                    />
                </FormControl>
                <FormDescription>
                    Faça upload de uma imagem do seu computador.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {product ? 'Salvar Alterações' : 'Criar Produto'}
        </Button>
      </form>
    </Form>
  );
}
