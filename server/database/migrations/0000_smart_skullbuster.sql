CREATE TABLE "imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"raw_json" text NOT NULL,
	"solves_added" integer DEFAULT 0 NOT NULL,
	"solves_skipped" integer DEFAULT 0 NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_key" varchar(50) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"puzzle_type" varchar(20) DEFAULT '333' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_key_unique" UNIQUE("session_key")
);
--> statement-breakpoint
CREATE TABLE "solves" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"import_id" integer NOT NULL,
	"time_ms" integer NOT NULL,
	"penalty" varchar(10) DEFAULT 'none' NOT NULL,
	"scramble" text NOT NULL,
	"comment" text,
	"solved_at" timestamp NOT NULL,
	"move_history" text,
	"puzzle_type" varchar(20) DEFAULT '333' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "solves" ADD CONSTRAINT "solves_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solves" ADD CONSTRAINT "solves_import_id_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."imports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "solve_dedup_idx" ON "solves" USING btree ("session_id","solved_at","scramble");