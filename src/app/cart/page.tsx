
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  removeProductFromCart,
  updateCartItemQuantity,
  useCart,
} from '@/firebase/cart';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatPrice } from '@/lib/utils';
import { CreditCard, Trash2, Loader2 } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { createOrderFromCart } from '@/firebase/orders';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user, isUserLoading } = useUser();
  const { cartItems, isLoading: isCartLoading, cartId } = useCart(user?.uid);
  const { toast } = useToast();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const total = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleRemoveItem = (cartItemId: string) => {
    if (!user || !cartId) return;
    removeProductFromCart(user.uid, cartId, cartItemId);
    toast({
      title: 'Item removido!',
      description: 'O produto foi removido do seu carrinho.',
    });
  };

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (!user || !cartId || newQuantity < 1) return;
    updateCartItemQuantity(user.uid, cartId, cartItemId, newQuantity);
  };

  const handlePlaceOrder = async () => {
    if (!user || !cartId || cartItems.length === 0 || !paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Erro no pedido',
        description: 'Selecione uma forma de pagamento e verifique seu carrinho.',
      });
      return;
    }
    setIsPlacingOrder(true);
    try {
      await createOrderFromCart(user, cartId, cartItems, paymentMethod, total);
      toast({
        title: 'Pedido realizado!',
        description: 'Seu pedido foi criado com sucesso.',
      });
      router.push('/orders');
    } catch (error) {
      // Error is handled by the global listener
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isUserLoading || isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Carrinho de Compras" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <PageHeader title="Carrinho de Compras" />
        <p className="mt-4">
          Você precisa estar logado para ver seu carrinho.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <PageHeader title="Carrinho de Compras" />
        <p className="mt-4">Seu carrinho está vazio.</p>
        <Button asChild className="mt-4">
          <Link href="/">Ver Produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Carrinho de Compras" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <ul className="divide-y divide-border">
                {cartItems.map((item) => {
                  const placeholder = PlaceHolderImages.find(
                    (p) => p.id === item.product.image
                  );
                  const imageUrl = item.product.image.startsWith('data:image') ? item.product.image : placeholder?.imageUrl;
                  const imageHint = item.product.image.startsWith('data:image') ? item.product.name : placeholder?.imageHint;
                  return (
                     <li key={item.id} className="flex items-start gap-4 py-4">
                      <div className="relative h-24 w-24 flex-shrink-0 self-start overflow-hidden rounded-md">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={imageHint}
                          />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
                        <div>
                          <h3 className="font-semibold break-words">{item.product.name}</h3>
                           <p className="text-sm font-medium text-muted-foreground">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, parseInt(e.target.value))
                              }
                              min={1}
                              className="h-8 w-16"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Remover item</span>
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="payment-method"
                  className="text-sm font-medium"
                >
                  Forma de Pagamento
                </label>
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Crédito ou Débito">
                      Cartão de Crédito/Débito
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder || !paymentMethod}>
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Finalizar Pedido
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
