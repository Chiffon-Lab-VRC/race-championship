'use client';

import { fetchAllData, type ChampionshipData } from '@/lib/dataManager';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function AdminPage() {
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
        <h1>ADMIN PANEL</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `racing-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1>ADMIN PANEL</h1>

      <div className="admin-grid">
        {/* レース管理 */}
        <div className={`racing-card ${styles.adminSection}`}>
          <h2>RACE MANAGEMENT</h2>
          <p>レースの追加・編集・削除</p>
          <div className={styles.raceList}>
            {data.races.map((race) => (
              <div key={race.id} className={styles.raceItem}>
                <div>
                  <strong>{race.name}</strong>
                  <br />
                  <span className={styles.raceDetail}>{race.circuit} - {race.date}</span>
                </div>
                <Link href={`/admin/race/${race.id}/edit`} className={`btn-racing ${styles.btnSmall}`}>
                  編集
                </Link>
              </div>
            ))}
          </div>
          <Link href="/admin/race/new/edit" className="btn-racing" style={{ marginTop: '1rem' }}>
            + 新規レース追加
          </Link>
        </div>

        {/* チーム管理 */}
        <div className={`racing-card ${styles.adminSection}`}>
          <h2>TEAM MANAGEMENT</h2>
          <p>チームの追加・編集・削除</p>
          <div className={styles.raceList}>
            {data.teams.map((team) => (
              <div key={team.id} className={styles.raceItem}>
                <div>
                  <strong>{team.name}</strong>
                  <br />
                  <span className={styles.raceDetail} style={{ color: team.color }}>{team.shortName}</span>
                </div>
                <Link href={`/admin/team/${team.id}/edit`} className={`btn-racing ${styles.btnSmall}`}>
                  編集
                </Link>
              </div>
            ))}
          </div>
          <Link href="/admin/team/new/edit" className="btn-racing" style={{ marginTop: '1rem' }}>
            + 新規チーム追加
          </Link>
        </div>

        {/* ドライバー管理 */}
        <div className={`racing-card ${styles.adminSection}`}>
          <h2>DRIVER MANAGEMENT</h2>
          <p>ドライバーの追加・編集・削除</p>
          <div className={styles.raceList}>
            {data.drivers.map((driver) => {
              const team = data.teams.find(t => t.id === driver.teamId);
              return (
                <div key={driver.id} className={styles.raceItem}>
                  <div>
                    <strong>{driver.name}</strong>
                    <br />
                    <span className={styles.raceDetail}>#{driver.number} - {team?.shortName}</span>
                  </div>
                  <Link href={`/admin/driver/${driver.id}/edit`} className={`btn-racing ${styles.btnSmall}`}>
                    編集
                  </Link>
                </div>
              );
            })}
          </div>
          <Link href="/admin/driver/new/edit" className="btn-racing" style={{ marginTop: '1rem' }}>
            + 新規ドライバー追加
          </Link>
        </div>

        {/* データ管理 */}
        <div className={`racing-card ${styles.adminSection}`}>
          <h2>DATA MANAGEMENT</h2>
          <p>データのインポート・エクスポート・リセット</p>

          <div className={styles.dataActions}>
            <button onClick={handleExport} className="btn-racing">
              データをエクスポート
            </button>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="racing-card" style={{ marginTop: '2rem' }}>
        <h2>STATISTICS</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{data.races.length}</div>
            <div className={styles.statLabel}>Races</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{data.drivers.length}</div>
            <div className={styles.statLabel}>Drivers</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{data.teams.length}</div>
            <div className={styles.statLabel}>Teams</div>
          </div>
        </div>
      </div>
    </div>
  );
}
