'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 合言葉をここで設定（本番環境では環境変数を使用してください）
const PASSPHRASE = 'racing2025';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // ローカルストレージから認証状態を読み込み
        const authStatus = localStorage.getItem('race-auth');
        if (authStatus === 'authenticated') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password: string): boolean => {
        if (password === PASSPHRASE) {
            setIsAuthenticated(true);
            localStorage.setItem('race-auth', 'authenticated');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('race-auth');
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-racing)',
            }}>
                LOADING...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
