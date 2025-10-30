'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PrimaveraLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const ADMIN_PASSWORD = '810Primavera*';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password === ADMIN_PASSWORD) {
      toast({
        title: 'Acesso concedido!',
        description: 'Bem-vindo(a) ao painel de administração.',
      });
      onLoginSuccess();
    } else {
      setError('Senha incorreta. Tente novamente.');
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'A senha que você digitou está incorreta.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PrimaveraLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline">Acesso ao Cofre</CardTitle>
          <CardDescription>
            Digite a chave mestra para visualizar as informações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Chave Mestra</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'Entrar no Painel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
