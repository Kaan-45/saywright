ALTER TABLE "siteler" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "siteler" ADD COLUMN "yayinda" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "siteler" ADD COLUMN "yayin_tarihi" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "siteler" ADD CONSTRAINT "siteler_slug_unique" UNIQUE("slug");