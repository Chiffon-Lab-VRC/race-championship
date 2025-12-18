'use client';

import { fetchAllData, calculateDriverStandings, calculateTeamStandings, type ChampionshipData } from '@/lib/dataManager';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import './globals.css';

export default function Home() {
  const [data, setData] = useState<ChampionshipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const championshipData = await fetchAllData();
        setData(championshipData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="container">
        <h1>FIA RACE CHAMPIONSHIP</h1>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      </div>
    );
  }

  const driverStandings = calculateDriverStandings(data).slice(0, 5);
  const teamStandings = calculateTeamStandings(data).slice(0, 3);
  const latestRace = data.races[data.races.length - 1];

  return (
    <div className="container">
      <div className={styles.hero}>
        <h1>RACING CHAMPIONSHIP</h1>
        <p>マルゲリータ アセットコルサ レーシング チャンピオンシップへようこそ</p>
      </div>

      {/* チャンピオンシップサマリー */}
      <div className={styles.dashboardGrid}>
        {/* ドライバーズランキングトップ5 */}
        <section className={styles.dashboardCard}>
          <h2>DRIVERS CHAMPIONSHIP - TOP 5</h2>
          <table className="racing-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>DRIVER</th>
                <th>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {driverStandings.map((standing, index) => (
                <tr key={standing.driver.id} className={`position-${index + 1}`}>
                  <td>{index + 1}</td>
                  <td>{standing.driver.name}</td>
                  <td>{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/championship" className="btn-racing" style={{ marginTop: '1rem', display: 'inline-block' }}>
            VIEW FULL STANDINGS
          </Link>
        </section>

        {/* コンストラクターズランキングトップ3 */}
        <section className={styles.dashboardCard}>
          <h2>CONSTRUCTORS CHAMPIONSHIP - TOP 3</h2>
          <table className="racing-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>TEAM</th>
                <th>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {teamStandings.map((standing, index) => (
                <tr key={standing.team.id} className={`position-${index + 1}`}>
                  <td>{index + 1}</td>
                  <td>{standing.team.shortName}</td>
                  <td>{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/championship" className="btn-racing" style={{ marginTop: '1rem', display: 'inline-block' }}>
            VIEW FULL STANDINGS
          </Link>
        </section>
      </div>

      {/* 最新レース */}
      {latestRace && (
        <section className={styles.latestRace}>
          <h2>LATEST RACE</h2>
          <div className="race-header">
            <div className="race-name">{latestRace.name}</div>
            <div className="race-circuit">{latestRace.circuit} - {latestRace.date}</div>
          </div>
          <Link href={`/races/${latestRace.id}`} className="btn-racing" style={{ marginTop: '1rem' }}>
            VIEW RACE RESULTS
          </Link>
        </section>
      )}
    </div>
  );
}
