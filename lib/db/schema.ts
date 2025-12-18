import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * ドライバーテーブル
 */
export const drivers = sqliteTable('drivers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    number: integer('number').notNull(),
    teamId: text('team_id').notNull(),
    nationality: text('nationality').notNull(),
    bio: text('bio').notNull(),
    photoUrl: text('photo_url'),
});

/**
 * チームテーブル
 */
export const teams = sqliteTable('teams', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    shortName: text('short_name').notNull(),
    color: text('color').notNull(),
    description: text('description').notNull(),
});

/**
 * レーステーブル
 */
export const races = sqliteTable('races', {
    id: text('id').primaryKey(),
    round: integer('round').notNull(),
    name: text('name').notNull(),
    circuit: text('circuit').notNull(),
    date: text('date').notNull(),
    country: text('country').notNull(),
});

/**
 * レースセッションテーブル
 */
export const raceSessions = sqliteTable('race_sessions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    raceId: text('race_id').notNull(),
    sessionType: text('session_type').notNull(),
    name: text('name').notNull(),
});

/**
 * レース結果テーブル
 */
export const raceResults = sqliteTable('race_results', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: integer('session_id').notNull(),
    position: integer('position').notNull(),
    driverId: text('driver_id').notNull(),
    teamId: text('team_id').notNull(),
    laps: integer('laps').notNull(),
    totalTime: text('total_time').notNull(),
    points: integer('points').notNull(),
    fastestLap: integer('fastest_lap', { mode: 'boolean' }).default(false),
});

// Type exports for use in the application
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Race = typeof races.$inferSelect;
export type NewRace = typeof races.$inferInsert;

export type RaceSession = typeof raceSessions.$inferSelect;
export type NewRaceSession = typeof raceSessions.$inferInsert;

export type RaceResult = typeof raceResults.$inferSelect;
export type NewRaceResult = typeof raceResults.$inferInsert;
