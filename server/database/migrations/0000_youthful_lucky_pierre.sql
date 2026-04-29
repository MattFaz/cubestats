CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`metric` text NOT NULL,
	`target_ms` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `goals_metric_unique_idx` ON `goals` (`metric`);--> statement-breakpoint
CREATE TABLE `imports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`raw_json` text NOT NULL,
	`solves_added` integer DEFAULT 0 NOT NULL,
	`solves_skipped` integer DEFAULT 0 NOT NULL,
	`imported_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_key` text NOT NULL,
	`display_name` text NOT NULL,
	`puzzle_type` text DEFAULT '333' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_key_unique` ON `sessions` (`session_key`);--> statement-breakpoint
CREATE TABLE `solves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`import_id` integer,
	`time_ms` integer NOT NULL,
	`penalty` text DEFAULT 'none' NOT NULL,
	`scramble` text NOT NULL,
	`comment` text,
	`solved_at` integer NOT NULL,
	`move_history` text,
	`puzzle_type` text DEFAULT '333' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`import_id`) REFERENCES `imports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `solve_dedup_idx` ON `solves` (`session_id`,`solved_at`,`scramble`);