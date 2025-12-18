import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * D1データベースクライアントを作成
 * 
 * @param db - Cloudflare D1 database binding
 * @returns Drizzle ORM instance
 */
export function createDbClient(db: D1Database) {
    return drizzle(db, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
