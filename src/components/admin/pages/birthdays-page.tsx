'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  AlertCircle,
  Cake,
} from 'lucide-react';
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
            const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
            
            const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

            const clientsWithBirthdayThisMonth = users
                .map(user => {
                    if (!user.birthDate) return null;
                    const birthDate = new Date(user.birthDate + 'T00:00:00'); // Ensure correct parsing
                    const birthMonth = birthDate.getMonth() + 1;
                    
                    if (birthMonth === currentMonth) {
                        return {
                            id: user.id,
                            fullName: user.fullName,
                            email: user.email,
                            phone: user.phone,
                            birthDate: user.birthDate,
                            day: String(birthDate.getDate()).padStart(2, '0')
                        };
                    }
                    return null;
                })
                .filter((c): c is ClientWithBirthday => c !== null)
                .sort((a, b) => parseInt(a.day) - parseInt(b.day));

            setBirthdays(clientsWithBirthdayThisMonth);
        } catch (err) {
            console.error("Falha ao carregar dados:", err);
            setError('Falha ao carregar aniversariantes. Verifique as permissões do Firestore.');
        } finally {
            setIsLoading(false);
        }
    };

    if(firestore) {
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
                 <CardDescription className="text-destructive">{error}</CardDescription>
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
          Clientes que fazem aniversário este mês. Aproveite para criar uma campanha!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Dia</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {birthdays.length > 0 ? (
              birthdays.map((client) => (
                <TableRow key={client.id}>
                   <TableCell>
                        <div className="flex items-center gap-2">
                            <Cake className="h-4 w-4 text-primary"/>
                            <span className="font-bold text-lg">{client.day}</span>
                        </div>
                    </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.fullName}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{client.phone || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhum aniversariante este mês.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
