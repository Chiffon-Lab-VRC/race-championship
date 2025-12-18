/**
 * 初期データをD1データベースにインポートするスクリプト
 * 使い方: node scripts/seed-data.mjs
 */

import initialData from '../lib/data/initial-data.json' assert { type: 'json' };
import { createClient } from '@libsql/client';

// D1ローカルデータベースのパス
const DB_PATH = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/ebd79ae8ba4a4e97b98774dba1cd8c8d.sqlite';

async function seedDatabase() {
    console.log('🌱 Seeding D1 database with initial data...\n');

    const client = createClient({
        url: `file:${DB_PATH}`,
    });

    try {
        // チームを追加
        console.log('📝 Inserting teams...');
        for (const team of initialData.teams) {
            await client.execute({
                sql: 'INSERT OR REPLACE INTO teams (id, name, short_name, color, description) VALUES (?, ?, ?, ?, ?)',
                args: [team.id, team.name, team.shortName, team.color, team.description],
            });
            console.log(`  ✅ ${team.name}`);
        }

        // ドライバーを追加
        console.log('\n📝 Inserting drivers...');
        for (const driver of initialData.drivers) {
            await client.execute({
                sql: 'INSERT OR REPLACE INTO drivers (id, name, number, team_id, nationality, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [
                    driver.id,
                    driver.name,
                    driver.number,
                    driver.teamId,
                    driver.nationality,
                    driver.bio,
                    driver.photoUrl || null,
                ],
            });
            console.log(`  ✅ ${driver.name}`);
        }

        // レースを追加
        console.log('\n📝 Inserting races...');
        for (const race of initialData.races) {
            // レースを挿入
            await client.execute({
                sql: 'INSERT OR REPLACE INTO races (id, round, name, circuit, date, country) VALUES (?, ?, ?, ?, ?, ?)',
                args: [race.id, race.round, race.name, race.circuit, race.date, race.country],
            });
            console.log(`  ✅ ${race.name}`);

            // セッションを追加
            for (const session of race.sessions) {
                const sessionResult = await client.execute({
                    sql: 'INSERT INTO race_sessions (race_id, session_type, name) VALUES (?, ?, ?) RETURNING id',
                    args: [race.id, session.sessionType, session.name],
                });

                const sessionId = sessionResult.rows[0].id;

                // 結果を追加
                for (const result of session.results) {
                    await client.execute({
                        sql: `INSERT INTO race_results 
              (session_id, position, driver_id, team_id, laps, total_time, points, fastest_lap) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [
                            sessionId,
                            result.position,
                            result.driverId,
                            result.teamId,
                            result.laps,
                            result.totalTime,
                            result.points,
                            result.fastestLap ? 1 : 0,
                        ],
                    });
                }
            }
        }

        console.log('\n✨ Database seeding completed successfully!');
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

seedDatabase();
