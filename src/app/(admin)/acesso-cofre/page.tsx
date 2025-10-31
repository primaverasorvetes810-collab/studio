'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const ADMIN_PASSWORD = 'primavera_admin'; // Senha para acessar o painel

export default function VaultAccessPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAccess = () => {
    setIsLoading(true);
    if (password === ADMIN_PASSWORD) {
      // Salva a permissão na sessionStorage para a sessão atual
      try {
        sessionStorage.setItem('admin-vault-access', 'granted');
        toast({
          title: 'Acesso Concedido',
          description: 'Bem-vindo ao painel de administração.',
        });
        router.push('/dashboard');
      } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Erro de Armazenamento',
            description: 'Não foi possível salvar a sessão. Tente desativar o modo de navegação anônima.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'A senha está incorreta.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                 <Lock className="h-6 w-6 text-primary" />
            </div>
          <CardTitle className="text-2xl">Acesso ao Cofre</CardTitle>
          <CardDescription>
            Esta área é restrita. Por favor, insira a senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Senha de Administrador</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
              placeholder="********"
            />
          </div>
          <Button onClick={handleAccess} disabled={isLoading} className="w-full">
            {isLoading ? 'Verificando...' : 'Entrar'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
