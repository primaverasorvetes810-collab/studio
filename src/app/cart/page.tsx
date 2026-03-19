'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  removeProductFromCart,
  updateCartItemQuantity,
  useCart,
} from '@/firebase/cart';
import { useUser, useFirestore, useStoreSettings } from '@/firebase';
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
import { CreditCard, Trash2, Loader2, MapPin, Info } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { createOrderFromCart, type User as UserProfile } from '@/firebase/orders';
import { useRouter } from 'next/navigation';
import { calculateShipping } from '@/ai/flows/calculate-shipping-flow';
import { getDoc, doc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';


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
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(true);
  const { settings, isLoading: isSettingsLoading } = useStoreSettings();
  const isStoreOpen = settings?.isOpen ?? true;


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
    if (isProfileLoading) return;

    setIsCalculatingShipping(true);
    setShippingError(null);
    setShippingFee(null);

    if (!userProfile?.neighborhood) {
        setIsCalculatingShipping(false);
        return;
    }

    calculateShipping({ neighborhood: userProfile.neighborhood })
      .then(result => {
        if (result.fee !== undefined && !result.error) {
          setShippingFee(result.fee);
          setShippingError(null);
        } else {
          setShippingError(result.error || 'Não é possível entregar neste bairro.');
          setShippingFee(null);
        }
      })
      .catch(() => {
        setShippingError('Falha ao calcular o frete.');
        setShippingFee(null);
      })
      .finally(() => {
        setIsCalculatingShipping(false);
      });
}, [userProfile, isProfileLoading]);

  const isProfileIncomplete = !userProfile?.address || !userProfile?.neighborhood || !userProfile?.city;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const total = subtotal + (shippingFee || 0);

  const handleRemoveItem = (cartItemId: string) => {
    if (!user || !cartId || !isStoreOpen) return;
    removeProductFromCart(user.uid, cartId, cartItemId);
    toast({
      title: 'Item removido!',
      description: 'O produto foi removido do seu carrinho.',
    });
  };

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (!user || !cartId || newQuantity < 1 || !isStoreOpen) return;
    updateCartItemQuantity(user.uid, cartId, cartItemId, newQuantity);
  };

  const playSuccessSound = () => {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3');
    audio.play().catch(error => {
      console.log("Falha ao reproduzir som de sucesso:", error);
    });
  }

  const handlePlaceOrder = async () => {
    if (!isStoreOpen) {
      return;
    }
    if (!user || !cartId || cartItems.length === 0) {
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
    if (isProfileIncomplete) {
        toast({
            variant: 'destructive',
            title: 'Endereço Incompleto',
            description: 'Por favor, atualize seu perfil com seu endereço completo para continuar.',
        });
        return;
    }
    if (shippingError) {
        toast({
            variant: 'destructive',
            title: 'Erro na Entrega',
            description: shippingError,
        });
        return;
    }
    if (subtotal > 0 && shippingFee === null) {
      toast({
        variant: 'destructive',
        title: 'Erro no Frete',
        description: 'Ainda não foi possível calcular o frete para seu endereço.',
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      await createOrderFromCart(user, cartId, cartItems, paymentMethod, shippingFee || 0);
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

  const isLoading = isUserLoading || isCartLoading || isProfileLoading || isSettingsLoading;

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
            <CardContent className={cn("p-6", !isStoreOpen && 'grayscale')}>
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
                              disabled={!isStoreOpen}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={!isStoreOpen}
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
        <div className="w-full lg:w-96 space-y-4">
           {!isStoreOpen && (
              <Alert variant="destructive" className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Loja Fechada</AlertTitle>
                  <AlertDescription>
                      {settings?.notice || 'Não estamos aceitando pedidos no momento.'}
                  </AlertDescription>
              </Alert>
          )}

           {isProfileIncomplete && !isProfileLoading && (
            <Alert variant="default" className="border-primary/50">
                <MapPin className="h-4 w-4" />
                <AlertTitle>Endereço Incompleto</AlertTitle>
                <AlertDescription>
                    Seu endereço de entrega parece incompleto.
                    <Link href="/profile" className="font-bold underline ml-1">
                        Atualize seu perfil
                    </Link>
                     .
                </AlertDescription>
            </Alert>
          )}

           {shippingError && !isProfileIncomplete && (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Fora da Área de Entrega</AlertTitle>
                <AlertDescription>
                    {shippingError}
                </AlertDescription>
            </Alert>
          )}

          <Card className={cn((isProfileIncomplete || !!shippingError) && 'opacity-60 pointer-events-none')}>
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
                ) : (
                  <span className="text-sm text-muted-foreground">--</span>
                )}
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
                <Select onValueChange={setPaymentMethod} value={paymentMethod} disabled={!isStoreOpen}>
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
              <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder || isCalculatingShipping || !paymentMethod || !isStoreOpen || isProfileIncomplete || !!shippingError}>
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
