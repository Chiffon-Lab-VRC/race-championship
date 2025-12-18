import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbClient } from '@/lib/db';
import { races, raceSessions, raceResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/races - 全レースを取得(セッションと結果を含む)
 */
export async function GET() {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        // レースを取得
        const allRaces = await db.select().from(races);

        // 各レースのセッションと結果を取得
        const racesWithSessions = await Promise.all(
            allRaces.map(async (race) => {
                const sessions = await db
                    .select()
                    .from(raceSessions)
                    .where(eq(raceSessions.raceId, race.id));

                const sessionsWithResults = await Promise.all(
                    sessions.map(async (session) => {
                        const results = await db
                            .select()
                            .from(raceResults)
                            .where(eq(raceResults.sessionId, session.id));

                        return {
                            ...session,
                            results,
                        };
                    })
                );

                return {
                    ...race,
                    sessions: sessionsWithResults,
                };
            })
        );

        return NextResponse.json(racesWithSessions);
    } catch (error) {
        console.error('Failed to fetch races:', error);
        return NextResponse.json(
            { error: 'Failed to fetch races' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/races - 新しいレースを追加(セッションと結果を含む)
 */
export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const { sessions, ...raceData } = body;

        // レースを追加
        const [newRace] = await db.insert(races).values(raceData).returning();

        // セッションと結果を追加
        if (sessions && sessions.length > 0) {
            for (const session of sessions) {
                const { results, ...sessionData } = session;

                const [newSession] = await db
                    .insert(raceSessions)
                    .values({
                        ...sessionData,
                        raceId: newRace.id,
                    })
                    .returning();

                if (results && results.length > 0) {
                    await db.insert(raceResults).values(
                        results.map((result: any) => ({
                            ...result,
                            sessionId: newSession.id,
                        }))
                    );
                }
            }
        }

        return NextResponse.json(newRace, { status: 201 });
    } catch (error) {
        console.error('Failed to create race:', error);
        return NextResponse.json(
            { error: 'Failed to create race' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/races - レース情報を更新
 */
export async function PUT(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const { id, sessions, ...updates } = body;

        // レース情報を更新
        const [updated] = await db
            .update(races)
            .set(updates)
            .where(eq(races.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { error: 'Race not found' },
                { status: 404 }
            );
        }

        // 既存のセッションと結果を削除
        const existingSessions = await db
            .select()
            .from(raceSessions)
            .where(eq(raceSessions.raceId, id));

        for (const session of existingSessions) {
            await db.delete(raceResults).where(eq(raceResults.sessionId, session.id));
        }
        await db.delete(raceSessions).where(eq(raceSessions.raceId, id));

        // 新しいセッションと結果を追加
        if (sessions && sessions.length > 0) {
            for (const session of sessions) {
                const { results, ...sessionData } = session;

                const [newSession] = await db
                    .insert(raceSessions)
                    .values({
                        ...sessionData,
                        raceId: id,
                    })
                    .returning();

                if (results && results.length > 0) {
                    await db.insert(raceResults).values(
                        results.map((result: any) => ({
                            ...result,
                            sessionId: newSession.id,
                        }))
                    );
                }
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update race:', error);
        return NextResponse.json(
            { error: 'Failed to update race' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/races?id=xxx - レースを削除
 */
export async function DELETE(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Race ID is required' },
                { status: 400 }
            );
        }

        // セッションと結果を削除
        const sessions = await db
            .select()
            .from(raceSessions)
            .where(eq(raceSessions.raceId, id));

        for (const session of sessions) {
            await db.delete(raceResults).where(eq(raceResults.sessionId, session.id));
        }
        await db.delete(raceSessions).where(eq(raceSessions.raceId, id));

        // レースを削除
        await db.delete(races).where(eq(races.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete race:', error);
        return NextResponse.json(
            { error: 'Failed to delete race' },
            { status: 500 }
        );
    }
}
