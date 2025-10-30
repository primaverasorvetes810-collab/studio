'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteDoc } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type AdminUser = {
    id: string;
    email: string;
};

const addAdminSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export default function AdminsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  const adminsQuery = useMemoFirebase(() => collection(firestore, 'roles_admin'), [firestore]);
  const { data: admins, isLoading } = useCollection<AdminUser>(adminsQuery);
  
  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: AddAdminFormValues) => {
    setIsSubmitting(true);
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', data.email), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Usuário não encontrado',
          description: `Nenhum usuário encontrado com o e-mail: ${data.email}`,
        });
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data();
      const adminRoleRef = doc(firestore, 'roles_admin', userDoc.id);

      await setDoc(adminRoleRef, { email: user.email });

      toast({
        title: 'Administrador adicionado!',
        description: `${user.email} agora tem permissões de administrador.`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description: 'Não foi possível adicionar o administrador. Verifique as permissões.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;
    try {
      const adminRef = doc(firestore, 'roles_admin', adminToDelete.id);
      await deleteDoc(adminRef);
      toast({
        title: 'Administrador removido',
        description: `${adminToDelete.email} não é mais um administrador.`,
      });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Ocorreu um erro",
            description: "Não foi possível remover o administrador.",
        });
    } finally {
        setDeleteAlertOpen(false);
        setAdminToDelete(null);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Administradores"
        description="Gerencie quem tem acesso ao painel."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Administradores Atuais</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : admins && admins.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>E-mail</TableHead>
                                <TableHead>UID</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">{admin.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{admin.id}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(admin)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum administrador encontrado.</p>
                )}
                </CardContent>
            </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Administrador</CardTitle>
              <CardDescription>
                Digite o e-mail do usuário para conceder acesso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail do Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    Conceder Acesso
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso removerá as permissões de administrador para <span className="font-semibold">"{adminToDelete?.email}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
