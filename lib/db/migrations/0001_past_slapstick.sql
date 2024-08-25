CREATE TABLE IF NOT EXISTS "transcripts" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"outcome" boolean DEFAULT false NOT NULL,
	"messages" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
