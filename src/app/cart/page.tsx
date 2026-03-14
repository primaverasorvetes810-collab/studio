'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  removeProductFromCart,
  updateCartItemQuantity,
  useCart,
} from '@/firebase/cart';
import { useUser, useFirestore } from '@/firebase';
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
import { formatPrice, getProductImageUrl } from '@/lib/utils';
import { CreditCard, Trash2, Loader2, MapPin } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { createOrderFromCart, type User as UserProfile } from '@/firebase/orders';
import { useRouter } from 'next/navigation';
import { calculateShipping } from '@/ai/flows/calculate-shipping-flow';
import { getDoc, doc } from 'firebase/firestore';


export default function CartPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { cartItems, isLoading: isCartLoading, cartId } = useCart(user?.uid);
  const { toast } = useToast();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);


  useEffect(() => {
    if (user && firestore) {
      setIsProfileLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef)
        .then(docSnap => {
          if (docSnap.exists()) {
            setUserProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
          }
        })
        .catch(() => {})
        .finally(() => setIsProfileLoading(false));
    } else {
        setIsProfileLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    if (userProfile?.address && userProfile.city) {
      const fullAddress = `${userProfile.address}, ${userProfile.neighborhood}, ${userProfile.city}`;
      setIsCalculatingShipping(true);
      setShippingError(null);
      setShippingFee(null);

      calculateShipping({ clientAddress: fullAddress })
        .then(result => {
          if (result.fee) {
            setShippingFee(result.fee);
          } else {
            setShippingError(result.error || 'Erro desconhecido.');
            setShippingFee(null);
          }
        })
        .catch(err => {
          setShippingError('Falha na comunicação.');
          setShippingFee(null);
        })
        .finally(() => {
          setIsCalculatingShipping(false);
        });
    } else if (userProfile) { // User profile loaded, but no address
        setShippingError('Endereço não cadastrado.');
        setShippingFee(null);
    }
  }, [userProfile]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const total = shippingFee !== null ? subtotal + shippingFee : subtotal;

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

  const playSuccessSound = () => {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3');
    audio.play().catch(error => {
      console.log("Falha ao reproduzir som de sucesso:", error);
    });
  }

  const handlePlaceOrder = async () => {
    if (!user || !cartId || cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro no pedido',
        description: 'Seu carrinho está vazio.',
      });
      return;
    }
     if (!paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Forma de Pagamento',
        description: 'Por favor, selecione uma forma de pagamento.',
      });
      return;
    }
    if (shippingFee === null) {
      toast({
        variant: 'destructive',
        title: 'Erro no Frete',
        description: shippingError || 'Não foi possível calcular o frete. Verifique seu endereço de cadastro.',
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      await createOrderFromCart(user, cartId, cartItems, paymentMethod, shippingFee);
      playSuccessSound();
      toast({
        title: 'Pedido realizado!',
        description: 'Seu pedido foi criado com sucesso.',
      });
      router.push('/orders');
    } catch (error: any) {
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const isLoading = isUserLoading || isCartLoading || isProfileLoading;

  if (isLoading) {
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
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <ul className="divide-y divide-border">
                {cartItems.map((item) => {
                  const imageUrl = getProductImageUrl(item.product);
                  const imageHint = item.product.name;
                  return (
                     <li key={item.id} className="flex items-start gap-4 py-4">
                      <div className="relative h-24 w-24 flex-shrink-0 self-start overflow-hidden rounded-md">
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          data-ai-hint={imageHint}
                        />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
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
        <div className="w-full lg:w-96">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center min-h-[24px]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Taxa de Entrega
                </span>
                {isCalculatingShipping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : shippingError ? (
                  <span className="text-sm text-right font-semibold text-destructive">{shippingError}</span>
                ) : shippingFee !== null ? (
                  <span>{formatPrice(shippingFee)}</span>
                ) : null}
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
              <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder || isCalculatingShipping || !paymentMethod}>
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
          {!userProfile?.address && !isProfileLoading && (
            <Card className="mt-4 border-dashed">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    <p>Parece que você não tem um endereço cadastrado.</p>
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href="/login">Atualize seu cadastro</Link>
                    </Button>
                     para calcular o frete.
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
