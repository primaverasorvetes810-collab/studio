import PageHeader from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orders, type Order } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusColors: Record<Order["status"], string> = {
  Pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  Paid: "bg-green-500/20 text-green-500 border-green-500/20",
  Overdue: "bg-red-500/20 text-red-500 border-red-500/20",
  Shipped: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  Delivered: "bg-primary/20 text-primary border-primary/20",
  Canceled: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="My Orders"
        description="Check the status of your recent orders."
      />
      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {orders.map((order) => (
              <AccordionItem value={order.id} key={order.id}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold">Order {order.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="hidden sm:inline font-bold text-primary">{formatPrice(order.total)}</span>
                       <Badge className={cn("whitespace-nowrap", statusColors[order.status])} variant="outline">
                         {order.status}
                       </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-4">
                    <p className="font-semibold">Items:</p>
                    <ul className="space-y-2">
                        {order.items.map((item) => (
                            <li key={item.product.id} className="flex justify-between text-sm">
                                <span>{item.product.name} x {item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span>{order.paymentMethod}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
