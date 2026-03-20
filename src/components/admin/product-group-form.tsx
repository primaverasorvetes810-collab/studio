'use client';

import { useState } from 'react';
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
import { createProductGroup, updateProductGroup, GroupPayload } from '@/firebase/product-groups';
import type { ProductGroup } from '@/lib/data/products';
import { Textarea } from '../ui/textarea';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '../ui/separator';

const GroupFormSchema = z.object({
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
  const [subgroups, setSubgroups] = useState<string[]>(group?.subgroups ?? []);
  const [newSubgroup, setNewSubgroup] = useState('');

  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
    },
  });

  const handleAddSubgroup = () => {
    if (newSubgroup && !subgroups.includes(newSubgroup)) {
      setSubgroups([...subgroups, newSubgroup.trim()]);
      setNewSubgroup('');
    }
  };

  const handleRemoveSubgroup = (subgroupToRemove: string) => {
    setSubgroups(subgroups.filter((s) => s !== subgroupToRemove));
  };


  const onSubmit = (data: z.infer<typeof GroupFormSchema>) => {
    const payload: GroupPayload = { ...data, subgroups };
    try {
      if (group) {
        updateProductGroup(group.id, payload);
        toast({ title: 'Sucesso!', description: 'Grupo de produtos atualizado.' });
      } else {
        createProductGroup(payload);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{group ? 'Editar Grupo' : 'Adicionar Novo Grupo'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do grupo. Você pode adicionar subgrupos para organizar melhor os produtos.
          </DialogDescription>
        </DialogHeader>
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
            
            <Separator className='my-2' />

            <div className="space-y-2">
                <FormLabel>Subgrupos</FormLabel>
                <div className="space-y-3 rounded-md border p-3">
                    {subgroups.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {subgroups.map((sub) => (
                            <Badge key={sub} variant="secondary">
                                {sub}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubgroup(sub)}
                                  className="ml-1.5 rounded-full p-0.5 text-secondary-foreground/50 hover:bg-destructive/80 hover:text-destructive-foreground"
                                  aria-label={`Remover subgrupo ${sub}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                            </Badge>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                    <Input
                        value={newSubgroup}
                        onChange={(e) => setNewSubgroup(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubgroup();
                            }
                        }}
                        placeholder="Ex: Cremosos, Frutados..."
                    />
                    <Button type="button" size="icon" onClick={handleAddSubgroup} disabled={!newSubgroup} aria-label="Adicionar subgrupo">
                        <Plus className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
            </div>


            <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
