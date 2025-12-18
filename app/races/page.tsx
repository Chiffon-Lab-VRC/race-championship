'use client';

import { fetchRaces, type Race } from '@/lib/dataManager';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function RacesPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const racesData = await fetchRaces();
        setRaces(racesData);
      } catch (err) {
        console.error('Failed to load races:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h1>RACES</h1>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>RACE CALENDAR</h1>

      <div className={styles.racesGrid}>
        {races.map((race) => (
          <Link href={`/ races / ${race.id} `} key={race.id}>
            <div className={`racing - card ${styles.raceCard} `}>
              <div className={styles.raceRound}>ROUND {race.round}</div>
              <h3>{race.name}</h3>
              <div className={styles.raceInfo}>
                <p className={styles.circuit}>{race.circuit}</p>
                <p className={styles.date}>{new Date(race.date).toLocaleDateString('ja-JP')}</p>
              </div>
              <div className={styles.sessionsCount}>
                {race.sessions.length} Session{race.sessions.length > 1 ? 's' : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
