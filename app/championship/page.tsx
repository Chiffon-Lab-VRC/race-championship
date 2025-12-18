'use client';

import { fetchAllData, calculateDriverStandings, calculateTeamStandings, type ChampionshipData } from '@/lib/dataManager';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ChampionshipPage() {
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
                <h1>CHAMPIONSHIP STANDINGS</h1>
                <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
            </div>
        );
    }

    const driverStandings = calculateDriverStandings(data);
    const teamStandings = calculateTeamStandings(data);

    return (
        <div className="container">
            <h1>CHAMPIONSHIP STANDINGS</h1>

            {/* ドライバーズチャンピオンシップ */}
            <section className={styles.championshipSection}>
                <h2>DRIVERS CHAMPIONSHIP</h2>
                <div className={styles.tableWrapper}>
                    <table className="racing-table">
                        <thead>
                            <tr>
                                <th>RANK</th>
                                <th>DRIVER NAME</th>
                                <th>TEAM</th>
                                <th>POINTS</th>
                                <th>WINS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {driverStandings.map((standing, index) => (
                                <tr
                                    key={standing.driver.id}
                                    className={`position-${index + 1}`}
                                >
                                    <td>{index + 1}</td>
                                    <td>{standing.driver.name}</td>
                                    <td>{standing.team.shortName}</td>
                                    <td>{standing.points}</td>
                                    <td>{standing.wins}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* コンストラクターズチャンピオンシップ */}
            <section className={styles.championshipSection}>
                <h2>CONSTRUCTORS CHAMPIONSHIP</h2>
                <div className={styles.tableWrapper}>
                    <table className="racing-table">
                        <thead>
                            <tr>
                                <th>RANK</th>
                                <th>TEAM NAME</th>
                                <th>POINTS</th>
                                <th>WINS</th>
                                <th>DRIVERS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamStandings.map((standing, index) => {
                                const driverNames = standing.drivers
                                    .map(driverId => {
                                        const driver = data.drivers.find(d => d.id === driverId);
                                        return driver ? driver.name : '';
                                    })
                                    .filter(name => name)
                                    .join(', ');

                                return (
                                    <tr
                                        key={standing.team.id}
                                        className={`position-${index + 1}`}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{standing.team.shortName}</td>
                                        <td>{standing.points}</td>
                                        <td>{standing.wins}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{driverNames}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
