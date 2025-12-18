import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Racing Championship",
  description: "レーシングチャンピオンシップ - ドライバーズ & コンストラクターズランキング",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <nav className={styles.mainNav}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.navLogo}>
              FIA MARC®
            </Link>
            <div className={styles.navLinks}>
              <Link href="/championship">CHAMPIONSHIP</Link>
              <Link href="/races">RACES</Link>
              <Link href="/teams">TEAMS</Link>
              <Link href="/drivers">DRIVERS</Link>
              <Link href="/admin" className={styles.navAdmin}>ADMIN</Link>
            </div>
          </div>
        </nav>
        <main className={styles.mainContent}>
          {children}
        </main>
      </body>
    </html>
  );
}

