'use client';

export const runtime = 'edge';

import { fetchAllData, calculateDriverStandings, calculateTeamStandings, type ChampionshipData } from '@/lib/dataManager';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
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
        <h1>Loading...</h1>
      </div>
    );
  }

  const team = data.teams.find(t => t.id === teamId);
  const teamStandings = calculateTeamStandings(data);
  const driverStandings = calculateDriverStandings(data);

  if (!team) {
    return (
      <div className="container">
        <h1>チームが見つかりません</h1>
        <Link href="/teams" className="btn-racing">チーム一覧に戻る</Link>
      </div>
    );
  }

  // チームの統計を取得
  const teamStanding = teamStandings.find(ts => ts.team.id === team.id);
  const teamDrivers = data.drivers.filter(d => d.teamId === team.id);
  const teamDriverStandings = teamDrivers.map(driver =>
    driverStandings.find(ds => ds.driver.id === driver.id)
  ).filter(Boolean);

  // チームのレース結果を取得
  const teamRaceResults = data.races.map(race => {
    const raceResults = race.sessions.flatMap(session =>
      session.results.filter(result => {
        const driver = data.drivers.find(d => d.id === result.driverId);
        return driver?.teamId === team.id;
      })
    );
    return {
      race,
      results: raceResults
    };
  });

  return (
    <div className="container">
      {/* チームヘッダー */}
      <div className="team-header" style={{ borderColor: team.color }}>
        <div className="team-color-bar" style={{ background: team.color }}></div>
        <h1>{team.name}</h1>
        <p className="team-short-name" style={{ color: team.color }}>{team.shortName}</p>
        <p className="team-description">{team.description}</p>
      </div>

      {/* チーム統計 */}
      <div className="stats-section">
        <h2>TEAM STATISTICS</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Championship Position</div>
            <div className="stat-value" style={{ color: team.color }}>
              #{teamStandings.findIndex(ts => ts.team.id === team.id) + 1}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Points</div>
            <div className="stat-value" style={{ color: team.color }}>
              {teamStanding?.points || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Wins</div>
            <div className="stat-value" style={{ color: team.color }}>
              {teamStanding?.wins || 0}
            </div>
          </div>
        </div>
      </div>

      {/* ドライバー一覧 */}
      <div className="drivers-section">
        <h2>DRIVERS</h2>
        <div className={styles.driversGrid}>
          {teamDriverStandings.map((standing, index) => (
            <Link
              href={`/drivers/${standing?.driver.id}`}
              key={standing?.driver.id}
              style={{ '--team-color': team.color } as React.CSSProperties}
            >
              <div className={styles.driverCard}>
                {/* グラデーション背景 */}
                <div className={styles.driverCardBackground}></div>

                {/* カード内容 */}
                <div className={styles.driverCardContent}>
                  {/* 写真エリア */}
                  <div className={styles.driverPhotoArea}>
                    {standing?.driver.photoUrl ? (
                      <img
                        src={standing.driver.photoUrl}
                        alt={standing.driver.name}
                      />
                    ) : (
                      <div className={styles.driverPhotoPlaceholder}>👤</div>
                    )}
                  </div>

                  {/* 情報エリア */}
                  <div className={styles.driverInfo}>
                    {/* カーナンバー（大きく薄く） */}
                    <div className={styles.driverNumber}>
                      {standing?.driver.number}
                    </div>

                    {/* ドライバー名 */}
                    <h3 className={styles.driverName}>
                      {standing?.driver.name}
                    </h3>

                    {/* 統計情報 */}
                    <div className={styles.driverStats}>
                      <div className={styles.driverStat}>
                        <div className={styles.driverStatLabel}>Rank</div>
                        <div className={styles.driverStatValue}>
                          #{driverStandings.findIndex(ds => ds.driver.id === standing?.driver.id) + 1}
                        </div>
                      </div>
                      <div className={styles.driverStat}>
                        <div className={styles.driverStatLabel}>Points</div>
                        <div className={styles.driverStatValue}>
                          {standing?.points}
                        </div>
                      </div>
                      <div className={styles.driverStat}>
                        <div className={styles.driverStatLabel}>Wins</div>
                        <div className={styles.driverStatValue}>
                          {standing?.wins}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* レース結果 */}
      <div className="race-results-section">
        <h2>RACE RESULTS</h2>
        {data.races.map((race) => {
          // このレースでチームが参加したセッションを取得
          const teamSessions = race.sessions.map(session => {
            const sessionResults = session.results.filter(result => {
              const driver = data.drivers.find(d => d.id === result.driverId);
              return driver?.teamId === team.id;
            });
            return { session, results: sessionResults };
          }).filter(s => s.results.length > 0);

          if (teamSessions.length === 0) return null;

          return (
            <div key={race.id} className="race-result-card racing-card">
              <h3>
                <Link href={`/races/${race.id}`}>
                  {race.name}
                </Link>
              </h3>
              <p className={styles.raceInfo}>{race.circuit} - {new Date(race.date).toLocaleDateString('ja-JP')}</p>

              {/* セッションごとに分けて表示 */}
              {teamSessions.map(({ session, results }) => (
                <div key={session.sessionType} style={{ marginBottom: teamSessions.length > 1 ? '2rem' : '0' }}>
                  {/* セッション名 */}
                  {teamSessions.length > 1 && (
                    <h4 style={{
                      fontSize: '1.1rem',
                      color: 'var(--racing-silver)',
                      marginBottom: '1rem',
                      marginTop: '1.5rem',
                      paddingLeft: '0.5rem',
                      borderLeft: '4px solid var(--racing-red)'
                    }}>
                      {session.sessionType}
                    </h4>
                  )}

                  <div className={styles.resultsTableWrapper}>
                    <table className={styles.resultsTable}>
                      <thead>
                        <tr>
                          <th>Pos</th>
                          <th>Driver</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results
                          .sort((a, b) => a.position - b.position)
                          .map((result, index) => {
                            const driver = data.drivers.find(d => d.id === result.driverId);
                            const positionClass = `${styles.positionRow} ${styles['positionRow' + result.position] || ''}`.trim();
                            return (
                              <tr key={`${race.id}-${session.sessionType}-${result.driverId}-${index}`} className={positionClass}>
                                <td className={styles.positionCell}>
                                  <span className={styles.positionBadge}>{result.position}</span>
                                </td>
                                <td className={styles.driverCell}>{driver?.name}</td>
                                <td className={styles.pointsCell}>{result.points} pts</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Link href="/teams" className="btn-secondary" style={{ marginTop: '2rem', display: 'inline-block' }}>
        ← チーム一覧に戻る
      </Link>
    </div>
  );
}
