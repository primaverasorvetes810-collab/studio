
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyAdminPage() {
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<'is-admin' | 'not-admin' | 'not-found' | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      // 1. Encontrar o usuário pelo e-mail
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email), limit(1));
      const userSnapshot = await getDocs(q);

      if (userSnapshot.empty) {
        setSearchResult('not-found');
        setIsSearching(false);
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.id;

      // 2. Verificar se o ID do usuário existe na coleção 'roles_admin'
      const adminRoleRef = doc(firestore, 'roles_admin', userId);
      const adminRoleSnap = await getDoc(adminRoleRef);

      if (adminRoleSnap.exists()) {
        setSearchResult('is-admin');
      } else {
        setSearchResult('not-admin');
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na busca',
        description: 'Não foi possível realizar a verificação. Verifique suas permissões.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const ResultDisplay = () => {
    if (!searchResult) return null;

    switch (searchResult) {
      case 'is-admin':
        return (
          <div className="mt-6 flex flex-col items-center gap-2 text-green-600">
            <ShieldCheck className="h-10 w-10" />
            <p className="font-semibold">Sim, este usuário é um administrador.</p>
          </div>
        );
      case 'not-admin':
        return (
          <div className="mt-6 flex flex-col items-center gap-2 text-yellow-600">
            <ShieldOff className="h-10 w-10" />
            <p className="font-semibold">Não, este usuário não é um administrador.</p>
          </div>
        );
      case 'not-found':
        return (
          <div className="mt-6 flex flex-col items-center gap-2 text-red-600">
            <p className="font-semibold">Nenhum usuário encontrado com este e-mail.</p>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Verificar Administrador"
        description="Consulte se um usuário possui permissões de administrador."
      />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Buscar por E-mail</CardTitle>
          <CardDescription>
            Insira o e-mail do usuário que você deseja verificar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching || !email}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="sr-only">Buscar</span>
            </Button>
          </form>

          {isSearching && (
            <div className="mt-6 flex justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <ResultDisplay />

        </CardContent>
      </Card>
    </div>
  );
}
