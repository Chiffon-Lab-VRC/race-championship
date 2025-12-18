'use client';

import { getData } from '@/lib/dataManager';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeamsPage() {
  const data = getData();

  return (
    <div className="container">
      <h1>TEAMS</h1>

      <div className={styles.teamsGrid}>
        {data.teams.map((team) => {
          const teamDrivers = data.drivers.filter(d => d.teamId === team.id);

          return (
            <Link
              href={`/teams/${team.id}`}
              key={team.id}
              className={styles.teamCard}
              style={{ '--team-color': team.color } as React.CSSProperties}
            >
              <div className={styles.cardBackground}></div>

              <div className={styles.cardContent}>
                <div className={styles.teamInfo}>
                  <h2 className={styles.teamName}>{team.name}</h2>
                  <p className={styles.teamShortName}>{team.shortName}</p>
                  <p className={styles.teamDescription}>{team.description}</p>
                </div>

                <div className={styles.driversSection}>
                  <span className={styles.driversLabel}>Drivers</span>
                  <div className={styles.driversList}>
                    {teamDrivers.map(driver => (
                      <span key={driver.id} className={styles.driverTag}>
                        {driver.name}
                      </span>
                    ))}
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
