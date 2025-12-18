'use client';

export const runtime = 'edge';

import { getData, getDriverById, getTeamById } from '@/lib/dataManager';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function RaceDetailPage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const data = getData();
  const race = data.races.find(r => r.id === raceId);
  const [viewMode, setViewMode] = useState<'podium' | 'table'>('podium');

  if (!race) {
    return (
      <div className="container">
        <h1>レースが見つかりません</h1>
        <Link href="/races" className="btn-racing">レース一覧に戻る</Link>
      </div>
    );
  }

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
