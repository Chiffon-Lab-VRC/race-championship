'use client';

import { useAuth } from '@/lib/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // ログインページ以外で未認証の場合はログインページへリダイレクト
        if (!isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, pathname, router]);

    // ログインページの場合は認証チェックをスキップ
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // 未認証の場合は何も表示しない（リダイレクト中）
    if (!isAuthenticated) {
        return null;
    }

    // 認証済みの場合はコンテンツを表示
    return <>{children}</>;
}
