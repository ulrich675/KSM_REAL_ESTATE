'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGate from '../../components/AuthGate';
import { useApp } from '../../context/AppContext';

export default function ConnexionPage() {
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