'use client';

import styles from "./layout.module.css";
import Link from "next/link";
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { usePathname } from 'next/navigation';

function Navigation() {
    const { logout } = useAuth();
    const pathname = usePathname();

    // ログインページではナビゲーションを表示しない
    if (pathname === '/login') {
        return null;
    }

    return (
        <nav className={styles.mainNav}>
            <div className={styles.navContainer}>
                <Link href="/" className={styles.navLogo}>
                    RACING CHAMPIONSHIP
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/championship">CHAMPIONSHIP</Link>
                    <Link href="/races">RACES</Link>
                    <Link href="/teams">TEAMS</Link>
                    <Link href="/drivers">DRIVERS</Link>
                    <Link href="/admin" className={styles.navAdmin}>ADMIN</Link>
                    <button onClick={logout} className={styles.navLogout}>
                        LOGOUT
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard>
                <Navigation />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </AuthGuard>
        </AuthProvider>
    );
}
