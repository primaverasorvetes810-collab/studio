'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, AlertCircle, Cake, Gift, Mail, Phone } from 'lucide-react';
import type { User as UserType } from '@/firebase/orders';

type ClientWithBirthday = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate: string; // YYYY-MM-DD
  day: string;
};

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<ClientWithBirthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true);
      setError(null);
      if (!firestore) return;

      try {
        const usersRef = collection(firestore, 'users');
        const usersSnap = await getDocs(usersRef);
        const users = usersSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as UserType)
        );

        const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

        const clientsWithBirthdayThisMonth = users
          .map((user) => {
            if (!user.birthDate) return null;
            // Corrigir o fuso horário adicionando T00:00:00
            const birthDate = new Date(user.birthDate + 'T00:00:00');
            const birthMonth = birthDate.getMonth() + 1;

            if (birthMonth === currentMonth) {
              return {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate,
                day: String(birthDate.getDate()).padStart(2, '0'),
              };
            }
            return null;
          })
          .filter((c): c is ClientWithBirthday => c !== null)
          .sort((a, b) => parseInt(a.day) - parseInt(b.day));

        setBirthdays(clientsWithBirthdayThisMonth);
      } catch (err) {
        console.error('Falha ao carregar dados:', err);
        setError(
          'Falha ao carregar aniversariantes. Verifique as permissões do Firestore.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (firestore) {
      fetchClientData();
    }
  }, [firestore]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Carregando aniversariantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader className="flex flex-row items-center gap-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <CardTitle>Erro ao carregar dados</CardTitle>
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aniversariantes do Mês</CardTitle>
        <CardDescription>
          Clientes que fazem aniversário este mês. Aproveite para criar uma
          campanha!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {birthdays.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {birthdays.map((client) => (
              <Card key={client.id} className="bg-background/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                        <span>{client.fullName}</span>
                        <div className="flex items-center gap-2 text-primary font-bold">
                             <Cake className="h-5 w-5" />
                             <span>Dia {client.day}</span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className="space-y-2 text-sm text-muted-foreground">
                     <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4"/>
                        <span>{client.email}</span>
                     </p>
                     <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4"/>
                        <span>{client.phone || 'Telefone não cadastrado'}</span>
                     </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
             <Gift className="h-12 w-12 text-muted-foreground" />
             <p className="mt-4 font-semibold text-lg">Nenhum aniversariante este mês.</p>
             <p className="text-muted-foreground text-sm">Volte no próximo mês para conferir a lista.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
