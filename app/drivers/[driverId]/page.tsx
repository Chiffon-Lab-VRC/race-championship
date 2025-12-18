'use client';

export const runtime = 'edge';

import { getData, calculateDriverStandings } from '@/lib/dataManager';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function DriverDetailPage() {
    const params = useParams();
    const driverId = params.driverId as string;
    const data = getData();
    const driver = data.drivers.find(d => d.id === driverId);
    const standings = calculateDriverStandings(data);
    const driverStanding = standings.find(s => s.driver.id === driverId);
    const team = data.teams.find(t => t.id === driver?.teamId);

    if (!driver || !driverStanding) {
        return (
            <div className="container">
                <h1>ドライバーが見つかりません</h1>
                <Link href="/drivers" className="btn-racing">ドライバー一覧に戻る</Link>
            </div>
        );
    }

    // ドライバーのレース結果を取得
    const driverRaceResults = data.races.map(race => {
        const raceResults = race.sessions.flatMap(session =>
            session.results
                .filter(result => result.driverId === driver.id)
                .map(result => ({
                    ...result,
                    sessionName: session.name
                }))
        );
        return {
            race,
            results: raceResults
        };
    }).filter(r => r.results.length > 0);

    const rankIndex = standings.findIndex(s => s.driver.id === driver.id);

    return (
        <div className="container">
            {/* ドライバーヘッダー */}
            <div
                className={styles.driverHeader}
                style={{ '--team-color': team?.color } as React.CSSProperties}
            >
                <div className={styles.headerBackground}></div>
                <div className={styles.headerContent}>
                    <div className={styles.photoSection}>
                        {driver.photoUrl ? (
                            <img
                                src={driver.photoUrl}
                                alt={driver.name}
                                className={styles.driverPhoto}
                            />
                        ) : (
                            <div className={styles.photoPlaceholder}>👤</div>
                        )}
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.driverNumber}>#{driver.number}</div>
                        <h1 className={styles.driverName}>{driver.name}</h1>
                        <p className={styles.teamName}>{team?.name}</p>
                        <p className={styles.bio}>{driver.bio}</p>

                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Championship Rank</span>
                                <span className={styles.statValue}>#{rankIndex + 1}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Total Points</span>
                                <span className={styles.statValue}>{driverStanding.points}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Wins</span>
                                <span className={styles.statValue}>{driverStanding.wins}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Podiums</span>
                                <span className={styles.statValue}>{driverStanding.podiums}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* レース結果 */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>RACE RESULTS</h2>
                <div className={styles.racesList}>
                    {driverRaceResults.map(({ race, results }) => (
                        <div key={race.id} className={styles.raceCard}>
                            <h3>
                                <Link href={`/races/${race.id}`}>
                                    {race.name}
                                </Link>
                            </h3>
                            <p className={styles.raceInfo}>
                                {race.circuit} - {new Date(race.date).toLocaleDateString('ja-JP')}
                            </p>
                            <div className={styles.resultsList}>
                                {results.map((result, idx) => (
                                    <div key={`${result.sessionName}-${idx}`} className={styles.resultItem}>
                                        <span className={styles.position}>P{result.position}</span>
                                        <span className={styles.sessionName}>{result.sessionName}</span>
                                        <span className={styles.points}>{result.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Link href="/drivers" className="btn-secondary" style={{ marginTop: '2rem', display: 'inline-block' }}>
                ← ドライバー一覧に戻る
            </Link>
        </div>
    );
}
