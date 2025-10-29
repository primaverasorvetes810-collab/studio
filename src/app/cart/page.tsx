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

export default function CartPage() {
  const { user, isUserLoading } = useUser();
  const {
    cartItems,
    isLoading: isCartLoading,
    cartId,
  } = useCart(user?.uid);
  const { toast } = useToast();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const shippingFee = 5;
  const total = subtotal + shippingFee;

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
                  return (
                    <li key={item.id} className="flex items-start gap-4 py-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        {placeholder && (
                          <Image
                            src={placeholder.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={placeholder.imageHint}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.id, parseInt(e.target.value))
                            }
                            min={1}
                            className="h-8 w-16"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
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
                <Select>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="card">
                      Cartão de Crédito/Débito
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Finalizar Pedido
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}