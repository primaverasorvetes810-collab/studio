'use client';

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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { User } from "@/firebase/orders"; // Reusing User type
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { collection } from "firebase/firestore";

export default function ClientsPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: clients, isLoading } = useCollection<User>(usersQuery);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Clientes" description="Gerencie seus clientes." />
      <Card>
        <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clients && clients.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Cliente Desde</TableHead>
                <TableHead>UID do Usuário</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.email}</TableCell>
                  <TableCell>{client.registerTime ? client.registerTime.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground">{client.id}</TableCell>
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
                        <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum cliente encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
