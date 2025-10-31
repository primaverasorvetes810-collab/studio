'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página serve apenas para redirecionar para o dashboard principal.
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return null; // Não renderiza nada, pois o redirecionamento é imediato.
}
