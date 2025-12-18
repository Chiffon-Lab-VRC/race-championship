import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbClient } from '@/lib/db';
import { raceSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/sessions?raceId=xxx - 特定レースの全セッションを取得
 */
export async function GET(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const raceId = searchParams.get('raceId');

        if (!raceId) {
            return NextResponse.json(
                { error: 'Race ID is required' },
                { status: 400 }
            );
        }

        const sessions = await db
            .select()
            .from(raceSessions)
            .where(eq(raceSessions.raceId, raceId));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Failed to fetch sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sessions - 新しいセッションを追加
 */
export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const newSession = await db.insert(raceSessions).values(body).returning();

        return NextResponse.json(newSession[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/sessions - セッション情報を更新
 */
export async function PUT(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const { id, ...updates } = body;

        const updated = await db
            .update(raceSessions)
            .set(updates)
            .where(eq(raceSessions.id, id))
            .returning();

        if (!updated.length) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Failed to update session:', error);
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/sessions?id=xxx - セッションを削除
 */
export async function DELETE(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        await db.delete(raceSessions).where(eq(raceSessions.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete session:', error);
        return NextResponse.json(
            { error: 'Failed to delete session' },
            { status: 500 }
        );
    }
}
