CREATE TABLE "siparisler" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kod" text NOT NULL,
	"site_id" uuid NOT NULL,
	"musteri_id" uuid,
	"eposta" text NOT NULL,
	"durum" text DEFAULT 'yeni' NOT NULL,
	"odeme_yontemi" text NOT NULL,
	"kalemler" jsonb NOT NULL,
	"teslimat" jsonb NOT NULL,
	"ara_toplam_kurus" integer NOT NULL,
	"kargo_kurus" integer NOT NULL,
	"toplam_kurus" integer NOT NULL,
	"kargo_takip" text,
	"olusturma" timestamp with time zone DEFAULT now() NOT NULL,
	"guncelleme" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "siparisler_kod_unique" UNIQUE("kod")
);
--> statement-breakpoint
ALTER TABLE "siteler" ADD COLUMN "surum" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_site_id_siteler_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."siteler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_musteri_id_magaza_musterileri_id_fk" FOREIGN KEY ("musteri_id") REFERENCES "public"."magaza_musterileri"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "siparis_site_idx" ON "siparisler" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "siparis_musteri_idx" ON "siparisler" USING btree ("musteri_id");