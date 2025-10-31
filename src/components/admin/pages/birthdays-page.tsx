
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import type { User } from '@/firebase/orders';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Cake } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseISO, startOfDay, getMonth, differenceInCalendarDays, setYear } from 'date-fns';


interface BirthdayClient extends User {
  anniversaryStatus: 'today' | 'soon' | 'thisMonth' | 'none';
  daysUntil: number;
}

// Helper function to calculate birthday status
const getAnniversaryStatus = (birthDate: string): Pick<BirthdayClient, 'anniversaryStatus' | 'daysUntil'> => {
  if (!birthDate) return { anniversaryStatus: 'none', daysUntil: 999 };

  try {
    const today = startOfDay(new Date());
    // The birthDate is 'YYYY-MM-DD', which is safe for parseISO
    const clientBirthDate = parseISO(birthDate);

    let nextBirthday = setYear(clientBirthDate, today.getFullYear());
    nextBirthday = startOfDay(nextBirthday);

    if (nextBirthday < today) {
      nextBirthday = setYear(nextBirthday, today.getFullYear() + 1);
    }
    
    const daysUntil = differenceInCalendarDays(nextBirthday, today);

    if (daysUntil === 0) {
      return { anniversaryStatus: 'today', daysUntil: 0 };
    }
    if (daysUntil <= 7) {
      return { anniversaryStatus: 'soon', daysUntil };
    }
    if (getMonth(nextBirthday) === getMonth(today)) {
      return { anniversaryStatus: 'thisMonth', daysUntil };
    }

    return { anniversaryStatus: 'none', daysUntil };
  } catch (error) {
    console.error("Error parsing date:", birthDate, error);
    return { anniversaryStatus: 'none', daysUntil: 999 };
  }
};

const statusConfig = {
  today: {
    className: 'bg-green-500/20 border-green-500/80',
    title: 'Aniversário Hoje!',
    iconColor: 'text-green-500',
  },
  soon: {
    className: 'bg-red-500/20 border-red-500/80',
    title: (days: number) => `Faltam ${days} ${days === 1 ? 'dia' : 'dias'}!`,
    iconColor: 'text-red-500',
  },
  thisMonth: {
    className: 'bg-yellow-500/20 border-yellow-500/80',
    title: 'Aniversário este mês',
    iconColor: 'text-yellow-500',
  },
  none: {
    className: 'bg-background',
    title: '',
    iconColor: 'text-muted-foreground',
  },
};


export default function BirthdaysPage() {
  const [clients, setClients] = useState<BirthdayClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    const fetchClients = async () => {
      if (!firestore) return;
      setIsLoading(true);
      setError(null);

      try {
        const usersQuery = query(collection(firestore, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

        const clientsWithStatus = users
          .filter(user => user.birthDate)
          .map(user => {
            const { anniversaryStatus, daysUntil } = getAnniversaryStatus(user.birthDate);
            return {
              ...user,
              anniversaryStatus,
              daysUntil,
            };
          });

        // Sort clients by status priority and then by days until birthday
        clientsWithStatus.sort((a, b) => {
          const statusOrder = { today: 0, soon: 1, thisMonth: 2, none: 3 };
          if (statusOrder[a.anniversaryStatus] !== statusOrder[b.anniversaryStatus]) {
            return statusOrder[a.anniversaryStatus] - statusOrder[b.anniversaryStatus];
          }
          return a.daysUntil - b.daysUntil;
        });

        setClients(clientsWithStatus);

      } catch (e: any) {
        setError("Falha ao carregar aniversariantes.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [firestore]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Aniversariantes" description="Acompanhe os aniversários dos seus clientes." />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : clients.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Cake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Nenhum cliente com data de aniversário.</h3>
            <p className="text-muted-foreground mt-2">Peça para seus clientes preencherem a data de nascimento no cadastro.</p>
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {clients.map(client => {
                const config = statusConfig[client.anniversaryStatus];
                const birthDate = parseISO(client.birthDate);
                const formattedDate = birthDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'UTC' });

                let title = config.title;
                if (typeof title === 'function') {
                    title = title(client.daysUntil);
                }
                
                return (
                <Tooltip key={client.id}>
                    <TooltipTrigger asChild>
                        <Card className={cn("text-center", config.className)}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base truncate">{client.fullName}</CardTitle>
                            <CardDescription className="text-sm">{formattedDate}</CardDescription>
                        </CardHeader>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{title}</p>
                    </TooltipContent>
                </Tooltip>
                );
            })}
            </div>
        </TooltipProvider>
      )}
    </div>
  );
}
