'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Loader2, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import { doc, getDoc, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function VerifyAdminPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ status: 'admin' | 'not_admin' | 'not_found' | 'error', message: string } | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Entrada inválida',
        description: 'Por favor, insira um endereço de e-mail.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // 1. Encontrar o usuário pelo e-mail
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email), limit(1));
      const userSnapshot = await getDocs(q);

      if (userSnapshot.empty) {
        setResult({ status: 'not_found', message: 'Nenhum usuário encontrado com este e-mail.' });
        setIsLoading(false);
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;

      // 2. Verificar se o usuário é um administrador
      const adminRoleRef = doc(firestore, 'roles_admin', userId);
      const adminRoleSnap = await getDoc(adminRoleRef);

      if (adminRoleSnap.exists()) {
        setResult({ status: 'admin', message: 'Sim, este usuário é um administrador.' });
      } else {
        setResult({ status: 'not_admin', message: 'Não, este usuário não é um administrador.' });
      }
    } catch (error) {
      console.error("Erro ao verificar o status de administrador:", error);
      setResult({ status: 'error', message: 'Ocorreu um erro ao realizar a busca. Verifique as permissões do Firestore e a conexão.' });
       toast({
        variant: 'destructive',
        title: 'Erro na busca',
        description: 'Não foi possível completar a verificação. Verifique as permissões do Firestore.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case 'admin':
        return <Shield className="h-6 w-6 text-green-500" />;
      case 'not_admin':
        return <ShieldOff className="h-6 w-6 text-yellow-500" />;
      case 'not_found':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'error':
         return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };
  
   const getResultColor = () => {
    if (!result) return '';
    switch (result.status) {
      case 'admin':
        return 'border-green-500 bg-green-500/10';
      case 'not_admin':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'not_found':
      case 'error':
        return 'border-red-500 bg-red-500/10';
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Verificar Status de Administrador</CardTitle>
          <CardDescription>
            Insira o endereço de e-mail de um usuário para verificar se ele possui privilégios de administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Verificar
            </Button>
          </div>

          {isLoading && (
            <div className="mt-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {result && !isLoading && (
            <div className={`mt-6 rounded-lg border p-4 flex items-center gap-4 ${getResultColor()}`}>
                {getResultIcon()}
                <p className="font-medium">{result.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
