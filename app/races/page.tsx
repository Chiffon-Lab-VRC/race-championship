'use client';

import { getData } from '@/lib/dataManager';
import Link from 'next/link';
import styles from './page.module.css';

export default function RacesPage() {
  const data = getData();

  return (
    <div className="container">
      <h1>RACE CALENDAR</h1>

      <div className={styles.racesGrid}>
        {data.races.map((race) => (
          <Link href={`/races/${race.id}`} key={race.id}>
            <div className={`racing-card ${styles.raceCard}`}>
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
