'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { ProductGroup } from '@/lib/data/products';
import { createProductGroup, updateProductGroup } from '@/firebase/product-groups';

const groupSchema = z.object({
  name: z.string().min(3, 'O nome do grupo deve ter pelo menos 3 caracteres.'),
  description: z.string().optional(),
});

export type GroupFormValues = z.infer<typeof groupSchema>;

interface ProductGroupFormProps {
  group?: ProductGroup | null;
  onSuccess?: () => void;
}

export function ProductGroupForm({ group, onSuccess }: ProductGroupFormProps) {
  const { toast } = useToast();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
    },
  });

  const onSubmit = async (data: GroupFormValues) => {
    try {
      if (group) {
        await updateProductGroup(group.id, data);
        toast({
          title: 'Grupo atualizado!',
          description: `"${data.name}" foi atualizado com sucesso.`,
        });
      } else {
        await createProductGroup(data);
        toast({
          title: 'Grupo criado!',
          description: `"${data.name}" foi adicionado.`,
        });
      }
      onSuccess?.();
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro.',
        description: 'Não foi possível salvar o grupo.',
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
              <FormLabel>Nome do Grupo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sorvetes de Massa" {...field} />
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
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Uma breve descrição sobre este grupo de produtos."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {group ? 'Salvar Alterações' : 'Criar Grupo'}
        </Button>
      </form>
    </Form>
  );
}
