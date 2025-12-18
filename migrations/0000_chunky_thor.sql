CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`number` integer NOT NULL,
	`team_id` text NOT NULL,
	`nationality` text NOT NULL,
	`bio` text NOT NULL,
	`photo_url` text
);
--> statement-breakpoint
CREATE TABLE `race_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`position` integer NOT NULL,
	`driver_id` text NOT NULL,
	`team_id` text NOT NULL,
	`laps` integer NOT NULL,
	`total_time` text NOT NULL,
	`points` integer NOT NULL,
	`fastest_lap` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `race_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`race_id` text NOT NULL,
	`session_type` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `races` (
	`id` text PRIMARY KEY NOT NULL,
	`round` integer NOT NULL,
	`name` text NOT NULL,
	`circuit` text NOT NULL,
	`date` text NOT NULL,
	`country` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`color` text NOT NULL,
	`description` text NOT NULL
);
