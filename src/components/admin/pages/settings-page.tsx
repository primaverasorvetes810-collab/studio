'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { deleteAllData } from '@/firebase/dev-ops';
import { Loader2, Trash2 } from 'lucide-react';

const CONFIRMATION_PHRASE = 'deletar tudo';

export default function SettingsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteAllData();
            toast({
                title: 'Operação Concluída',
                description: 'Todos os dados do aplicativo foram excluídos.',
            });
        } catch(error) {
            console.error('Failed to delete all data:', error);
            toast({
                variant: 'destructive',
                title: 'Erro na Exclusão',
                description: 'Ocorreu um erro ao tentar excluir os dados. Verifique o console para mais detalhes.',
            });
        } finally {
            setIsDeleting(false);
            setIsDialogOpen(false);
            setConfirmationInput('');
        }
    }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        <CardDescription>
          As ações nesta seção são permanentes e não podem ser desfeitas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 className="font-semibold">Excluir Todos os Dados</h3>
                <p className="text-sm text-muted-foreground">
                    Isto irá apagar permanentemente todos os produtos, grupos, clientes e pedidos.
                </p>
            </div>
             <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Tudo
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é irreversível. Todos os dados do Firestore (produtos, usuários, pedidos, etc.) serão permanentemente excluídos. As contas de autenticação de usuário não serão afetadas.
                            <br/><br/>
                            Para confirmar, digite <strong>{CONFIRMATION_PHRASE}</strong> abaixo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="confirmation-input">Confirmação</Label>
                        <Input 
                            id="confirmation-input"
                            value={confirmationInput}
                            onChange={(e) => setConfirmationInput(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmationInput('')}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={confirmationInput.toLowerCase() !== CONFIRMATION_PHRASE || isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Eu entendo, excluir tudo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
