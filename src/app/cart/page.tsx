import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { products } from "@/lib/data/products";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Trash2 } from "lucide-react";
import PageHeader from "@/components/page-header";

export default function CartPage() {
  const cartItems = products.slice(0, 3);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

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
                    (p) => p.id === item.image
                  );
                  return (
                    <li key={item.id} className="flex items-start gap-4 py-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        {placeholder && (
                          <Image
                            src={placeholder.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            data-ai-hint={placeholder.imageHint}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            type="number"
                            defaultValue={1}
                            min={1}
                            className="h-8 w-16"
                          />
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
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
                <span>{formatPrice(5)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal + 5)}</span>
              </div>
              <div className="grid gap-2">
                <label htmlFor="payment-method" className="text-sm font-medium">
                  Forma de Pagamento
                </label>
                <Select>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="card">Cartão de Crédito/Débito</SelectItem>
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
