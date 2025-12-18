'use client';

export const runtime = 'edge';

import { fetchAllData, fetchRaces, createRace, updateRaceData, type Race, type Driver, type ChampionshipData } from '@/lib/dataManager';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { RaceSession, RaceResult } from '@/lib/dataManager';
import styles from './page.module.css';

export default function RaceEditPage() {
    const params = useParams();
    const router = useRouter();
    const raceId = params.raceId as string;
    const isNew = raceId === 'new';

    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [pointsSystem, setPointsSystem] = useState<Record<string, number>>({});
    const [race, setRace] = useState<Race | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchAllData();
                setDrivers(data.drivers);
                setPointsSystem(data.pointsSystem);

                if (isNew) {
                    const races = await fetchRaces();
                    const nextRound = races.length + 1;
                    setRace({
                        id: `rd${nextRound}-tbd`,
                        round: nextRound,
                        name: `Rd.${nextRound} TBD`,
                        circuit: '',
                        date: new Date().toISOString().split('T')[0],
                        country: 'JPN',
                        sessions: [{
                            sessionType: 'RACE 1',
                            name: 'RACE 1',
                            results: data.drivers.map((driver, index) => ({
                                position: index + 1,
                                driverId: driver.id,
                                teamId: driver.teamId,
                                laps: 0,
                                totalTime: '00:00:000',
                                points: 0,
                            }))
                        }]
                    });
                } else {
                    const races = await fetchRaces();
                    const foundRace = races.find(r => r.id === raceId);
                    if (foundRace) {
                        setRace(foundRace);
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                alert('データの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [raceId, isNew]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!race) return;

        try {
            const raceData: Partial<Race> = {
                round: race.round,
                name: race.name,
                circuit: race.circuit,
                date: race.date,
                country: race.country,
                sessions: race.sessions
            };

            if (isNew) {
                await createRace(raceData as Omit<Race, 'id'>);
                alert('レースを追加しました！');
            } else {
                await updateRaceData(raceId, raceData);
                alert('レースを更新しました！');
            }
            router.push('/admin');
        } catch (error) {
            console.error('Failed to save race:', error);
            alert('保存に失敗しました');
        }
    };

    const handleResultChange = (sessionIndex: number, resultIndex: number, field: keyof RaceResult, value: any) => {
        if (!race) return;
        const newRace = { ...race };
        const result = newRace.sessions[sessionIndex].results[resultIndex];
        (result as any)[field] = value;

        // ポイント自動計算
        if (field === 'position') {
            const position = parseInt(value);
            result.points = pointsSystem[position.toString()] || 0;
        }

        setRace(newRace);
    };

    const addSession = () => {
        if (!race) return;
        const newSession: RaceSession = {
            sessionType: `RACE ${race.sessions.length + 1}`,
            name: `RACE ${race.sessions.length + 1}`,
            results: drivers.map((driver, index) => ({
                position: index + 1,
                driverId: driver.id,
                teamId: driver.teamId,
                laps: 0,
                totalTime: '00:00:000',
                points: 0,
            }))
        };

        setRace({
            ...race,
            sessions: [...race.sessions, newSession]
        });
    };

    if (loading || !race) {
        return (
            <div className="container">
                <h1>Loading...</h1>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>{isNew ? '新規レース追加' : 'レース編集'}</h1>

            {/* レース基本情報 */}
            <div className="racing-card" style={{ marginBottom: '2rem' }}>
                <h2>レース情報</h2>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>レース名</label>
                        <input
                            type="text"
                            value={race.name}
                            onChange={(e) => setRace({ ...race, name: e.target.value })}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>サーキット</label>
                        <input
                            type="text"
                            value={race.circuit}
                            onChange={(e) => setRace({ ...race, circuit: e.target.value })}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>開催日</label>
                        <input
                            type="date"
                            value={race.date}
                            onChange={(e) => setRace({ ...race, date: e.target.value })}
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ラウンド</label>
                        <input
                            type="number"
                            value={race.round}
                            onChange={(e) => setRace({ ...race, round: parseInt(e.target.value) })}
                            className={styles.formInput}
                        />
                    </div>
                </div>
            </div>

            {/* セッション結果 */}
            {race.sessions.map((session, sessionIndex) => (
                <div key={sessionIndex} className="racing-card" style={{ marginBottom: '2rem' }}>
                    <h2>{session.sessionType}</h2>
                    <div className={styles.tableWrapper}>
                        <table className="racing-table">
                            <thead>
                                <tr>
                                    <th>順位</th>
                                    <th>ドライバー</th>
                                    <th>周回数</th>
                                    <th>タイム</th>
                                    <th>ポイント</th>
                                    <th>FL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {session.results.map((result, resultIndex) => {
                                    const driver = drivers.find(d => d.id === result.driverId);
                                    return (
                                        <tr key={resultIndex}>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={result.position}
                                                    onChange={(e) => handleResultChange(sessionIndex, resultIndex, 'position', e.target.value)}
                                                    className={styles.formInputSmall}
                                                    min="1"
                                                />
                                            </td>
                                            <td>{driver?.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={result.laps}
                                                    onChange={(e) => handleResultChange(sessionIndex, resultIndex, 'laps', parseInt(e.target.value))}
                                                    className={styles.formInputSmall}
                                                    min="0"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={result.totalTime}
                                                    onChange={(e) => handleResultChange(sessionIndex, resultIndex, 'totalTime', e.target.value)}
                                                    className={styles.formInputMedium}
                                                    placeholder="HH:MM:SSS"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={result.points}
                                                    onChange={(e) => handleResultChange(sessionIndex, resultIndex, 'points', parseInt(e.target.value))}
                                                    className={styles.formInputSmall}
                                                    min="0"
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={result.fastestLap || false}
                                                    onChange={(e) => handleResultChange(sessionIndex, resultIndex, 'fastestLap', e.target.checked)}
                                                    style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* アクション */}
            <div className={styles.actions}>
                <button onClick={addSession} className="btn-secondary">
                    + セッション追加
                </button>
                <button onClick={handleSubmit} className="btn-racing">
                    保存
                </button>
                <button onClick={() => router.push('/admin')} className="btn-secondary">
                    キャンセル
                </button>
            </div>

        </div>
    );
}
