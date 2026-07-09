'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { currentUser } = useApp();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!currentUser) {
            router.replace(`/connexion?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [currentUser, pathname, router]);

    if (!currentUser) {
        return null;
    }

    return <>{children}</>;
}