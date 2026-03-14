'use client';

import { useStoreSettings } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function StoreClosedBanner() {
  const { settings, isLoading } = useStoreSettings();

  if (isLoading) {
    // Don't show a skeleton, just wait for the settings to load to avoid layout shift.
    return null;
  }

  if (settings?.isOpen) {
    return null;
  }

  return (
    <div className="sticky top-16 z-30">
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 text-center flex items-center justify-center flex-col sm:flex-row p-3 sm:p-4">
            <Info className="hidden sm:block h-5 w-5 mr-3" />
            <div className='flex items-center gap-2'>
                <AlertTitle className="font-semibold mb-0">Loja Fechada:</AlertTitle>
                <AlertDescription className="text-destructive">
                    {settings?.notice || 'Não estamos aceitando pedidos no momento.'}
                </AlertDescription>
            </div>
        </Alert>
    </div>
  );
}
