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
import { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStorage } from '@/firebase';
import { uploadFileAndGetURL } from '@/firebase/storage';
import { Progress } from '@/components/ui/progress';
import imageCompression from 'browser-image-compression';

const ImagePayloadSchema = z.object({
  imageUrl: z.string().url('Por favor, insira ou envie uma imagem para obter uma URL válida.'),
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
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const { id: toastId, update } = toast({ 
        title: 'Otimizando imagem...', 
        description: 'Isso leva apenas um instante.' 
    });

    const options = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1920,
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
      setImageFile(file); // Fallback to original
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

  const onSubmit = (data: z.infer<typeof ImagePayloadSchema>) => {
    onFormSubmit(); // Close dialog immediately

    const saveImageAsync = async () => {
        const { id: toastId, update } = toast({
            title: 'Salvando imagem...',
            description: 'Aguarde enquanto processamos seu envio.',
        });

        try {
          let finalImageUrl = image?.imageUrl; 

          if (imageFile) {
            finalImageUrl = await uploadFileAndGetURL(
              storage,
              imageFile,
              'carousel',
              (progress) => update({
                id: toastId,
                title: 'Enviando imagem...',
                description: <Progress value={progress} className="w-full" />,
              })
            );
          } else if (!data.imageUrl) {
            finalImageUrl = ''; // Handle case where image is removed
          }

          if (!finalImageUrl) {
            update({ id: toastId, variant: 'destructive', title: 'Erro', description: 'A imagem é obrigatória.' });
            return;
          }
          
          update({ id: toastId, title: 'Finalizando...', description: 'Salvando informações.' });

          const payload = { ...data, imageUrl: finalImageUrl };

          if (image) {
            await updateCarouselImage(image.id, payload);
          } else {
            await createCarouselImage(payload);
          }

          update({
            id: toastId,
            title: 'Sucesso!',
            description: image ? 'Imagem do carrossel atualizada.' : 'Nova imagem adicionada ao carrossel.',
          });

        } catch (error) {
          console.error('Form submission error:', error);
          update({ id: toastId, variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a imagem.' });
        }
    }

    saveImageAsync();
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{image ? 'Editar Imagem' : 'Adicionar Nova Imagem'}</DialogTitle>
          <DialogDescription>
            Envie uma imagem e preencha os detalhes. Clique em salvar quando terminar.
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
                          <FormLabel>Imagem do Carrossel</FormLabel>
                          <div className='flex flex-col gap-4'>
                            <FormControl>
                                <Input 
                                    type="file" 
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/gif, image/webp"
                                />
                            </FormControl>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isCompressing}>
                                {isCompressing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {isCompressing ? 'Otimizando...' : (imageUrlValue ? 'Trocar Imagem' : 'Enviar Imagem')}
                            </Button>
                          </div>
                           <div className="mt-4 flex h-[132px] items-center justify-center rounded-lg border bg-muted p-4">
                                {isCompressing ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                ) : imageUrlValue ? (
                                    <Image 
                                        src={imageUrlValue} 
                                        alt="Pré-visualização da imagem" 
                                        width={200}
                                        height={100}
                                        className="aspect-video rounded-md object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground">
                                        <UploadCloud className="mx-auto mb-2 h-8 w-8" />
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
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCompressing}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isCompressing}>
                        {isCompressing ? 'Otimizando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
