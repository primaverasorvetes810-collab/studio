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
import type { CarouselImage } from '@/firebase/carousel';
import { createCarouselImage, updateCarouselImage } from '@/firebase/carousel';
import { useState } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const ImagePayloadSchema = z.object({
  imageUrl: z.string().min(1, 'A imagem é obrigatória.'),
  altText: z.string().min(1, 'O texto alternativo é obrigatório.'),
  link: z.string().url('Por favor, insira uma URL válida para o link.').optional().or(z.literal('')),
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
  const [preview, setPreview] = useState<string | null>(image?.imageUrl ?? null);

  const form = useForm<z.infer<typeof ImagePayloadSchema>>({
    resolver: zodResolver(ImagePayloadSchema),
    defaultValues: {
      imageUrl: image?.imageUrl ?? '',
      altText: image?.altText ?? '',
      link: image?.link ?? '',
      order: image?.order ?? currentOrder,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof ImagePayloadSchema>) => {
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
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a imagem.' });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{image ? 'Editar Imagem' : 'Adicionar Nova Imagem'}</DialogTitle>
          <DialogDescription>
            Faça o upload de uma imagem e preencha os detalhes. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem</FormLabel>
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
            <FormField
              control={form.control}
              name="altText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Alternativo (Descrição)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Promoção de sorvetes" {...field} />
                  </FormControl>
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
      </DialogContent>
    </Dialog>
  );
}
