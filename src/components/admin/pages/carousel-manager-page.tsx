'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Pencil, Trash2, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { CarouselImage } from '@/firebase/carousel';
import { deleteCarouselImage, updateCarouselImageOrder } from '@/firebase/carousel';
import { CarouselImageForm } from '../carousel-image-form';

export default function CarouselManagerPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [deletingImage, setDeletingImage] = useState<CarouselImage | null>(null);

  const carouselImagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'carouselImages'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: images, isLoading, setData: setImages } = useCollection<CarouselImage>(carouselImagesQuery);

  const handleAddNew = () => {
    setEditingImage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image);
    setIsFormOpen(true);
  };

  const handleDelete = (image: CarouselImage) => {
    setDeletingImage(image);
  };

  const confirmDelete = async () => {
    if (!deletingImage) return;
    try {
      await deleteCarouselImage(deletingImage.id);
      toast({ title: 'Sucesso', description: 'Imagem do carrossel deletada.' });
      setDeletingImage(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível deletar a imagem.' });
    }
  };
  
  const handleMove = async (index: number, direction: 'up' | 'down') => {
      if (!images) return;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= images.length) return;
  
      const updatedImages = Array.from(images);
      const [movedImage] = updatedImages.splice(index, 1);
      updatedImages.splice(newIndex, 0, movedImage);
  
      // Optimistic update
      setImages(updatedImages);
  
      try {
        const updates = updatedImages.map((img, idx) => ({
          id: img.id,
          order: idx,
        }));
        await updateCarouselImageOrder(updates);
        toast({ title: 'Ordem atualizada!' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível reordenar as imagens.' });
        setImages(images); // Revert on error
      }
    };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Carrossel</CardTitle>
              <CardDescription>Adicione, remova e reordene as imagens da página inicial.</CardDescription>
            </div>
            <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar Imagem</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {!isLoading && (!images || images.length === 0) && (
            <p className="text-center text-muted-foreground py-8">Nenhuma imagem no carrossel.</p>
          )}
          <div className="space-y-4">
            {images?.map((image, index) => (
              <Card key={image.id} className="flex items-center p-4 gap-4">
                <Image
                  src={image.imageUrl}
                  alt={image.altText || ''}
                  width={128}
                  height={72}
                  className="aspect-video rounded-md object-cover"
                />
                <div className="flex-grow min-w-0">
                  
                </div>
                 <div className="flex-shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleMove(index, 'up')}
                                disabled={index === 0}
                            >
                                <ArrowUp className="mr-2 h-4 w-4" /> Mover para Cima
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleMove(index, 'down')}
                                disabled={index === images.length - 1}
                            >
                                <ArrowDown className="mr-2 h-4 w-4" /> Mover para Baixo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(image)}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(image)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Deletar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {isFormOpen && (
        <CarouselImageForm
          image={editingImage}
          onOpenChange={setIsFormOpen}
          onFormSubmit={() => setIsFormOpen(false)}
          currentOrder={images?.length || 0}
        />
      )}

      <AlertDialog open={!!deletingImage} onOpenChange={(open) => !open && setDeletingImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a imagem do carrossel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sim, deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
