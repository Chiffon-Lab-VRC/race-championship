import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbClient } from '@/lib/db';
import { drivers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/drivers - 全ドライバーを取得
 */
export async function GET() {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const allDrivers = await db.select().from(drivers);
        return NextResponse.json(allDrivers);
    } catch (error) {
        console.error('Failed to fetch drivers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch drivers' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/drivers - 新しいドライバーを追加
 */
export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const newDriver = await db.insert(drivers).values(body).returning();

        return NextResponse.json(newDriver[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create driver:', error);
        return NextResponse.json(
            { error: 'Failed to create driver' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/drivers - ドライバー情報を更新
 */
export async function PUT(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const body = await request.json();
        const { id, ...updates } = body;

        // チーム移籍の場合、過去の全レース結果のteamIdも更新
        if (updates.teamId) {
            // まず、現在のドライバー情報を取得して移籍かどうか確認
            const currentDriver = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);

            if (currentDriver.length > 0 && currentDriver[0].teamId !== updates.teamId) {
                // チームが変更される場合、race_resultsのteam_idも更新
                await db.execute(
                    `UPDATE race_results SET team_id = ? WHERE driver_id = ?`,
                    [updates.teamId, id]
                );
                console.log(`Updated race results team_id for driver ${id} to ${updates.teamId}`);
            }
        }

        const updated = await db
            .update(drivers)
            .set(updates)
            .where(eq(drivers.id, id))
            .returning();

        if (!updated.length) {
            return NextResponse.json(
                { error: 'Driver not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Failed to update driver:', error);
        return NextResponse.json(
            { error: 'Failed to update driver' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/drivers?id=xxx - ドライバーを削除
 */
export async function DELETE(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const db = createDbClient(env.DB);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Driver ID is required' },
                { status: 400 }
            );
        }

        await db.delete(drivers).where(eq(drivers.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete driver:', error);
        return NextResponse.json(
            { error: 'Failed to delete driver' },
            { status: 500 }
        );
    }
}
