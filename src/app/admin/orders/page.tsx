import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orders, type Order } from "@/lib/data/orders";
import { clients } from "@/lib/data/clients";
import { formatPrice } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<Order["status"], string> = {
    Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
    Pago: "bg-green-500/20 text-green-500 border-green-500/20",
    Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
    Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
    Entregue: "bg-primary/20 text-primary border-primary/20",
    Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

export default function OrdersAdminPage() {
    const ordersWithClients = orders.map((order, index) => ({
        ...order,
        client: clients[index % clients.length],
    }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Pedidos" description="Gerencie os pedidos dos clientes." />
      <Card>
        <CardHeader>
            <CardTitle>Histórico de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersWithClients.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <Badge className={cn(statusColors[order.status])} variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.client.name}</TableCell>
                  <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Alternar menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
