'use client';

import { useState, useEffect } from 'react';
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
import { useStoreSettings, updateStoreSettings } from '@/firebase/store-settings';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const CONFIRMATION_PHRASE = 'deletar tudo';

function StoreStatusManager() {
    const { settings, isLoading } = useStoreSettings();
    const [notice, setNotice] = useState('');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings?.notice) {
            setNotice(settings.notice);
        }
    }, [settings]);

    const handleStatusToggle = async (isOpen: boolean) => {
        setIsSaving(true);
        try {
            await updateStoreSettings({ isOpen });
            toast({
                title: 'Status da Loja Atualizado',
                description: `A loja agora está ${isOpen ? 'Aberta' : 'Fechada'}.`,
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o status da loja.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoticeSave = async () => {
        setIsSaving(true);
        try {
            await updateStoreSettings({ notice });
            toast({ title: 'Aviso Salvo!', description: 'A mensagem da loja fechada foi atualizada.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o aviso.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <div className="flex justify-end">
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Status da Loja</CardTitle>
                <CardDescription>
                    Abra ou feche a loja para novos pedidos e defina uma mensagem de aviso.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="store-status-toggle" className="text-base font-medium">
                            Loja {settings?.isOpen ? 'Aberta' : 'Fechada'}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Quando fechada, os clientes não poderão finalizar novos pedidos.
                        </p>
                    </div>
                    <Switch
                        id="store-status-toggle"
                        checked={settings?.isOpen ?? true}
                        onCheckedChange={handleStatusToggle}
                        disabled={isSaving}
                        aria-label="Abrir ou fechar a loja"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="closed-notice">Mensagem de Loja Fechada</Label>
                    <Textarea
                        id="closed-notice"
                        placeholder="Ex: Voltamos amanhã às 18h!"
                        value={notice}
                        onChange={(e) => setNotice(e.target.value)}
                        disabled={settings?.isOpen || isSaving}
                    />
                    <p className="text-sm text-muted-foreground">
                        Esta mensagem será exibida para os clientes quando a loja estiver fechada.
                    </p>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleNoticeSave} disabled={settings?.isOpen || isSaving}>
                       {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                       Salvar Mensagem
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


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
    <div className="space-y-6">
        <StoreStatusManager />
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
    </div>
  );
}
