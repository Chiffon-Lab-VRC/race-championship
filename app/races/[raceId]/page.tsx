'use client';

export const runtime = 'edge';

import { fetchAllData, getDriverById, getTeamById, type ChampionshipData } from '@/lib/dataManager';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function RaceDetailPage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const [data, setData] = useState<ChampionshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'podium' | 'table'>('podium');

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

  const race = data.races.find(r => r.id === raceId);

  if (!race) {
    return (
      <div className="container">
        <h1>レースが見つかりません</h1>
        <Link href="/races" className="btn-racing">レース一覧に戻る</Link>
      </div>
    );
  }

  const isScheduled = !race.sessions || race.sessions.length === 0;

  // 予定レースの表示
  if (isScheduled) {
    return (
      <div className="container">
        <div className={styles.raceHeader}>
          <div className={styles.raceRound}>ROUND {race.round}</div>
          <div className={styles.scheduledBadge}>📅 予定</div>
          <h1>{race.name}</h1>
          <div className={styles.raceInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>サーキット</span>
              <span className={styles.infoValue}>{race.circuit}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>開催日</span>
              <span className={styles.infoValue}>{new Date(race.date).toLocaleDateString('ja-JP')}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>国</span>
              <span className={styles.infoValue}>{race.country}</span>
            </div>
          </div>
        </div>
        <div className="racing-card" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--racing-silver)' }}>🏁 レース未開催</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            このレースはまだ開催されていません。<br />
            開催後、結果がこちらに表示されます。
          </p>
        </div>
        <Link href="/races" className="btn-racing" style={{ marginTop: '2rem' }}>
          レース一覧に戻る
        </Link>
      </div>
    );
  }

  // 既存のレース結果表示ロジック...
  const mainSession = race.sessions.find(s => s.sessionType.includes('RACE'));
  return (
    <div className="container">
      {/* レースヘッダー */}
      <div className={styles.raceHeaderWrapper}>
        <div className="race-header">
          <div className="race-name">{race.name}</div>
          <div className="race-circuit">{race.circuit} - {new Date(race.date).toLocaleDateString('ja-JP')}</div>
        </div>

        {/* ビューモード切り替えボタン */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'podium' ? styles.active : ''}`}
            onClick={() => setViewMode('podium')}
          >
            🏆 ポディウム
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.active : ''}`}
            onClick={() => setViewMode('table')}
          >
            📊 詳細
          </button>
        </div>
      </div>

      {/* 全セッションの結果を表示 */}
      {race.sessions.map((session, sessionIndex) => {
        // 結果を順位順にソート
        const sortedResults = [...session.results].sort((a, b) => a.position - b.position);
        const topThree = sortedResults.slice(0, 3);
        const others = sortedResults.slice(3);

        return (
          <div key={sessionIndex} className={styles.sessionSection}>
            {/* セッションタイトル */}
            <h2 className={styles.sessionTitle}>{session.sessionType}</h2>

            {viewMode === 'podium' ? (
              <>
                {/* ポディウム表示（トップ3） - F1風に2位、1位、3位の順 */}
                <div className={styles.podium}>
                  {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((result) => {
                    const driver = getDriverById(data, result.driverId);
                    const team = getTeamById(data, result.teamId);
                    const podiumClass = `${styles.podiumCard} ${styles[`position${result.position}`]}`;

                    return (
                      <div key={result.position} className={podiumClass}>
                        {/* 写真エリア */}
                        <div className={styles.podiumPhoto}>
                          {driver?.photoUrl ? (
                            <img src={driver.photoUrl} alt={driver.name} />
                          ) : (
                            <div className={styles.podiumPhotoPlaceholder}>👤</div>
                          )}
                        </div>

                        {/* 順位バッジ */}
                        <div className={styles.podiumRank}>{result.position}</div>

                        {/* ドライバー情報 */}
                        <div className={styles.podiumInfo}>
                          <div className={styles.podiumDriverName}>{driver?.name}</div>
                          <div className={styles.podiumTeamName}>{team?.name}</div>
                          <div className={styles.podiumPoints}>{result.points} PTS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4位以降のリスト表示 */}
                {others.length > 0 && (
                  <div className={styles.resultsListWrapper}>
                    <div className={styles.resultsList}>
                      {others.map((result) => {
                        const driver = getDriverById(data, result.driverId);
                        const team = getTeamById(data, result.teamId);

                        return (
                          <div key={result.position} className={styles.resultRow}>
                            <div className={styles.resultPosition}>{result.position}</div>
                            <div className={styles.resultDriver}>
                              <span className={styles.resultDriverName}>{driver?.name}</span>
                            </div>
                            <div className={styles.resultTeam}>{team?.name}</div>
                            <div className={styles.resultPoints}>{result.points} PTS</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 詳細テーブル表示モード */
              <div className={styles.tableWrapper}>
                <table className="racing-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>RANKING</th>
                      <th>DRIVERS</th>
                      <th>TEAM</th>
                      <th style={{ textAlign: 'center' }}>LAPS</th>
                      <th style={{ textAlign: 'center' }}>TOTAL TIME</th>
                      <th style={{ textAlign: 'center' }}>POINTS</th>
                      <th style={{ textAlign: 'center' }}>FL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((result) => {
                      const driver = getDriverById(data, result.driverId);
                      const team = getTeamById(data, result.teamId);

                      return (
                        <tr key={result.position} className={`position-${result.position}`}>
                          <td style={{ textAlign: 'center' }}>{result.position}</td>
                          <td>{driver?.name || 'Unknown'}</td>
                          <td>{team?.name || 'Unknown'}</td>
                          <td style={{ textAlign: 'center' }}>{result.laps}</td>
                          <td style={{ textAlign: 'center' }}>{result.totalTime}</td>
                          <td style={{ textAlign: 'center' }}>{result.points}</td>
                          <td style={{ textAlign: 'center' }}>
                            {result.fastestLap && (
                              <span className={styles.fastestLapBadge}>⏱️</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <Link href="/races" className="btn-secondary" style={{ marginTop: '2rem', display: 'inline-block' }}>
        ← レース一覧に戻る
      </Link>
    </div>
  );
}
