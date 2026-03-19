
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart, removeProductFromCart, updateCartItemQuantity } from '@/firebase/cart';
import { useUser, useStoreSettings } from '@/firebase';
import { Separator } from '@/components/ui/separator';
import { formatPrice, getProductImageUrl } from '@/lib/utils';
import { Trash2, Loader2, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { user } = useUser();
  const { cartItems, isLoading, cartId } = useCart(user?.uid);
  const { settings } = useStoreSettings();
  const isStoreOpen = settings?.isOpen ?? true;
  const { toast } = useToast();

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleRemoveItem = (cartItemId: string) => {
    if (!user || !cartId || !isStoreOpen) return;
    removeProductFromCart(user.uid, cartId, cartItemId);
    toast({
      title: 'Item removido!',
      description: 'O produto foi removido do seu carrinho.',
    });
  };

  const handleQuantityChange = (cartItemId: string, currentQuantity: number, change: number) => {
    if (!user || !cartId || !isStoreOpen) return;
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
    } else {
      updateCartItemQuantity(user.uid, cartId, cartItemId, newQuantity);
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-16 w-16 rounded-full md:h-20 md:w-20">
          <Image
            src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773962015/Design_sem_nome__1_-removebg-preview_xvnfog.png"
            alt="Carrinho de Compras"
            fill
            className="object-contain"
          />
          {totalItems > 0 && (
            <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground md:right-2 md:top-2 md:h-8 md:w-8 md:text-lg">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Carrinho de Compras</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>
        <Separator />
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="relative h-24 w-24 text-muted-foreground">
                 <Image
                    src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773962015/Design_sem_nome__1_-removebg-preview_xvnfog.png"
                    alt="Carrinho de Compras Vazio"
                    fill
                    className="object-contain opacity-50"
                  />
            </div>
            <p className="font-semibold">Seu carrinho está vazio</p>
            <SheetClose asChild>
                <Button asChild>
                    <Link href="/products">Ver produtos</Link>
                </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 px-6 py-4">
                {cartItems.map(item => {
                  const imageUrl = getProductImageUrl(item.product);
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={imageUrl} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <span className="font-semibold truncate">{item.product.name}</span>
                        <span className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</span>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-2 rounded-full border">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleQuantityChange(item.id, item.quantity, -1)} disabled={!isStoreOpen}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                             <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleQuantityChange(item.id, item.quantity, 1)} disabled={!isStoreOpen}>
                                <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleRemoveItem(item.id)} disabled={!isStoreOpen}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 pt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Frete e impostos serão calculados na próxima etapa.</p>
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link href="/cart">Ir para o Checkout</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
