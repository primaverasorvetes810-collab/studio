'use client';

import PageHeader from "@/components/page-header";
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
import { type Order, useAllOrders } from "@/firebase/orders";
import { formatPrice } from "@/lib/utils";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const statusColors: Record<Order["status"], string> = {
    Pendente: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
    Pago: "bg-green-500/20 text-green-500 border-green-500/20",
    Atrasado: "bg-red-500/20 text-red-500 border-red-500/20",
    Enviado: "bg-blue-500/20 text-blue-500 border-blue-500/20",
    Entregue: "bg-primary/20 text-primary border-primary/20",
    Cancelado: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

function OrdersAdminContent() {
    const { orders, isLoading, error } = useAllOrders();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                Ocorreu um erro ao carregar os pedidos.
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Nenhum pedido encontrado.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente (ID)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                <span className="sr-only">Ações</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {orders.map((order) => (
                <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                <TableCell>
                    <Badge className={cn(statusColors[order.status])} variant="outline">{order.status}</Badge>
                </TableCell>
                <TableCell>{order.orderDate.toDate().toLocaleDateString()}</TableCell>
                <TableCell>{order.userName || order.userId.substring(0,10)}...</TableCell>
                <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
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
    );
}

export default function OrdersAdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/admin/login');
        }
    }, [user, isUserLoading, router]);

    return (
        <div className="flex flex-col gap-8">
          <PageHeader title="Pedidos" description="Gerencie os pedidos dos clientes." />
          <Card>
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
                {isUserLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : user ? (
                    <OrdersAdminContent />
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        Você precisa estar logado para ver esta página.
                        <Button asChild variant="link">
                            <Link href="/admin/login">Fazer Login</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      );
}
