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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { createProductGroup, updateProductGroup } from '@/firebase/product-groups';
import type { ProductGroup } from '@/lib/data/products';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const GroupPayloadSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
});

type GroupFormProps = {
  group: ProductGroup | null;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
};

export function ProductGroupForm({ group, onOpenChange, onFormSubmit }: GroupFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof GroupPayloadSchema>>({
    resolver: zodResolver(GroupPayloadSchema),
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
    },
  });

  const onSubmit = (data: z.infer<typeof GroupPayloadSchema>) => {
    try {
      if (group) {
        // Atualiza o grupo existente
        updateProductGroup(group.id, data);
        toast({ title: 'Sucesso!', description: 'Grupo de produtos atualizado.' });
      } else {
        // Cria um novo grupo
        createProductGroup(data);
        toast({ title: 'Sucesso!', description: 'Novo grupo de produtos adicionado.' });
      }
      onFormSubmit();
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o grupo de produtos.',
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{group ? 'Editar Grupo' : 'Adicionar Novo Grupo'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do grupo. Clique em salvar quando terminar.
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
                    <FormLabel>Nome do Grupo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Açaí, Sorvetes, Bebidas" {...field} />
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
                        <Textarea placeholder="Descreva a categoria..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
                </DialogFooter>
            </form>
            </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
