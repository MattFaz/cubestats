CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric" varchar(20) NOT NULL,
	"target_ms" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
