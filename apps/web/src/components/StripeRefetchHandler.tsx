"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { toast } from '@/components/ui/components';

function StripeRefetchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refetch } = useAuth();

  useEffect(() => {
    const success = searchParams.get('billing_success');
    
    if (success === 'true') {
      console.log('[StripeRefetch] Success detected, refreshing data...');
      
      // 1. Atualizar o estado do usuário (Plano)
      refetch();
      
      // 2. Notificar o sistema para atualizar gráficos e sumários
      window.dispatchEvent(new Event('operation-created'));
      
      // 3. Mostrar feedback visual
      toast.success('Assinatura processada com sucesso! Seu plano foi atualizado.');

      // 4. Limpar a URL sem recarregar a página
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('billing_success');
      const queryString = newParams.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;
      
      router.replace(newUrl);
    }
  }, [searchParams, refetch, router]);

  return null;
}

export function StripeRefetchHandler() {
  return (
    <Suspense fallback={null}>
      <StripeRefetchContent />
    </Suspense>
  );
}
