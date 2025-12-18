import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbClient } from '@/lib/db';
import { teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/teams - 全チームを取得
 */
export async function GET() {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const allTeams = await db.select().from(teams);
        return NextResponse.json(allTeams);
    } catch (error) {
        console.error('Failed to fetch teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/teams - 新しいチームを追加
 */
export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const newTeam = await db.insert(teams).values(body).returning();

        return NextResponse.json(newTeam[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create team:', error);
        return NextResponse.json(
            { error: 'Failed to create team' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/teams - チーム情報を更新
 */
export async function PUT(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const { id, ...updates } = body;

        const updated = await db
            .update(teams)
            .set(updates)
            .where(eq(teams.id, id))
            .returning();

        if (!updated.length) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Failed to update team:', error);
        return NextResponse.json(
            { error: 'Failed to update team' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/teams?id=xxx - チームを削除
 */
export async function DELETE(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Team ID is required' },
                { status: 400 }
            );
        }

        await db.delete(teams).where(eq(teams.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete team:', error);
        return NextResponse.json(
            { error: 'Failed to delete team' },
            { status: 500 }
        );
    }
}
