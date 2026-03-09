'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products');
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecionando para a nossa loja...</p>
      </div>
    </div>
  );
}
