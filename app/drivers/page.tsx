'use client';

export const runtime = 'edge';

import { fetchAllData, calculateDriverStandings, type ChampionshipData } from '@/lib/dataManager';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DriversPage() {
  const [data, setData] = useState<ChampionshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const championshipData = await fetchAllData();
        setData(championshipData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h1>DRIVERS</h1>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <h1>DRIVERS</h1>
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--racing-red)' }}>
          {error || 'データが見つかりません'}
        </p>
      </div>
    );
  }

  const standings = calculateDriverStandings(data);

  return (
    <div className="container">
      <h1>DRIVERS</h1>

      <div className={styles.driversGrid}>
        {standings.map((standing, index) => {
          const team = data.teams.find(t => t.id === standing.driver.teamId);

          return (
            <Link
              href={`/drivers/${standing.driver.id}`}
              key={standing.driver.id}
              className={styles.driverCard}
              style={{ '--team-color': team?.color } as React.CSSProperties}
            >
              <div className={styles.cardBackground}></div>

              <div className={styles.photoContainer}>
                {standing.driver.photoUrl ? (
                  <img
                    src={standing.driver.photoUrl}
                    alt={standing.driver.name}
                    className={styles.driverPhoto}
                  />
                ) : (
                  <div className={styles.photoPlaceholder}>👤</div>
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.driverNumber}>{standing.driver.number}</div>

                <div className={styles.driverInfo}>
                  <h2 className={styles.driverName}>{standing.driver.name}</h2>
                  <p className={styles.teamName}>{team?.shortName}</p>

                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Rank</span>
                      <span className={styles.statValue}>#{index + 1}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Points</span>
                      <span className={styles.statValue}>{standing.points}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Wins</span>
                      <span className={styles.statValue}>{standing.wins}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
