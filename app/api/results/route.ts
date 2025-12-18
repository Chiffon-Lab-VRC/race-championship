import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbClient } from '@/lib/db';
import { raceResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/results?sessionId=xxx - 特定セッションの全結果を取得
 */
export async function GET(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const results = await db
            .select()
            .from(raceResults)
            .where(eq(raceResults.sessionId, parseInt(sessionId)));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Failed to fetch results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/results - 新しい結果を追加
 */
export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const newResult = await db.insert(raceResults).values(body).returning();

        return NextResponse.json(newResult[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create result:', error);
        return NextResponse.json(
            { error: 'Failed to create result' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/results - 結果情報を更新
 */
export async function PUT(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const { id, ...updates } = body;

        const updated = await db
            .update(raceResults)
            .set(updates)
            .where(eq(raceResults.id, id))
            .returning();

        if (!updated.length) {
            return NextResponse.json(
                { error: 'Result not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Failed to update result:', error);
        return NextResponse.json(
            { error: 'Failed to update result' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/results?id=xxx - 結果を削除
 */
export async function DELETE(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Result ID is required' },
                { status: 400 }
            );
        }

        await db.delete(raceResults).where(eq(raceResults.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete result:', error);
        return NextResponse.json(
            { error: 'Failed to delete result' },
            { status: 500 }
        );
    }
}
