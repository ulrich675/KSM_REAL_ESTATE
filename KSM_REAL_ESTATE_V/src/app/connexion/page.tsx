'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGate from '../../components/AuthGate';
import { useApp } from '../../context/AppContext';

function ConnexionContent() {
  const { currentUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (currentUser) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    }
  }, [currentUser, router, searchParams]);

  if (currentUser) {
    return null;
  }

  return <AuthGate />;
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-white)' }}>Chargement en cours...</div>}>
      <ConnexionContent />
    </Suspense>
  );
}