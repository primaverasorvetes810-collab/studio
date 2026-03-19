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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { CarouselImage } from '@/firebase/carousel';
import { createCarouselImage, updateCarouselImage } from '@/firebase/carousel';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ImagePayloadSchema = z.object({
  imageUrl: z.string().min(1, 'A URL da imagem é obrigatória.').url('Por favor, insira uma URL de imagem válida.'),
  altText: z.string().min(1, 'O texto alternativo é obrigatório.'),
  link: z.string().url('Por favor, insira uma URL válida para o link.').or(z.literal('')).optional(),
  order: z.number(),
});

type ImageFormProps = {
  image: CarouselImage | null;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
  currentOrder: number;
};

export function CarouselImageForm({ image, onOpenChange, onFormSubmit, currentOrder }: ImageFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof ImagePayloadSchema>>({
    resolver: zodResolver(ImagePayloadSchema),
    defaultValues: {
      imageUrl: image?.imageUrl ?? '',
      altText: image?.altText ?? '',
      link: image?.link ?? '',
      order: image?.order ?? currentOrder,
    },
  });

  const imageUrlValue = form.watch('imageUrl');

  const onSubmit = async (data: z.infer<typeof ImagePayloadSchema>) => {
    setIsSaving(true);
    try {
      if (image) {
        await updateCarouselImage(image.id, data);
        toast({ title: 'Sucesso!', description: 'Imagem do carrossel atualizada.' });
      } else {
        await createCarouselImage(data);
        toast({ title: 'Sucesso!', description: 'Nova imagem adicionada ao carrossel.' });
      }
      onFormSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a imagem.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{image ? 'Editar Imagem' : 'Adicionar Nova Imagem'}</DialogTitle>
          <DialogDescription>
            Insira o link da imagem e preencha os detalhes. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>URL da Imagem</FormLabel>
                          <FormControl>
                              <Input placeholder="https://.../imagem.jpg" {...field} />
                          </FormControl>
                           <div className="mt-4 flex h-[132px] items-center justify-center rounded-lg border bg-muted p-4">
                                {imageUrlValue ? (
                                    <Image 
                                        src={imageUrlValue} 
                                        alt="Pré-visualização da imagem" 
                                        width={200}
                                        height={100}
                                        className="aspect-video rounded-md object-contain"
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
                name="altText"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Texto Alternativo (Descrição)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Promoção de sorvetes" {...field} />
                    </FormControl>
                     <FormDescription>
                        Essencial para acessibilidade e SEO.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Link (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://exemplo.com/pagina-da-promocao" {...field} />
                    </FormControl>
                     <FormDescription>
                        Leva o usuário a uma página quando ele clica na imagem.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
