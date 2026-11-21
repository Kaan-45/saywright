CREATE TABLE "yayin_talepleri" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"durum" text DEFAULT 'bekliyor' NOT NULL,
	"slug" text NOT NULL,
	"alan_adi" text,
	"istenen_plan" text,
	"tutar_kurus" integer DEFAULT 0 NOT NULL,
	"odeme_kodu" text NOT NULL,
	"admin_notu" text,
	"olusturma" timestamp with time zone DEFAULT now() NOT NULL,
	"karar_tarihi" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "kullanicilar" ADD COLUMN "rol" text DEFAULT 'kullanici' NOT NULL;--> statement-breakpoint
ALTER TABLE "siteler" ADD COLUMN "yayin_onayi" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "siteler" ADD COLUMN "alan_adi" text;--> statement-breakpoint
ALTER TABLE "yayin_talepleri" ADD CONSTRAINT "yayin_talepleri_kullanici_id_kullanicilar_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanicilar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yayin_talepleri" ADD CONSTRAINT "yayin_talepleri_site_id_siteler_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."siteler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "yayin_talebi_durum_idx" ON "yayin_talepleri" USING btree ("durum");--> statement-breakpoint
CREATE UNIQUE INDEX "yayin_talebi_bekleyen_uniq" ON "yayin_talepleri" USING btree ("site_id") WHERE "yayin_talepleri"."durum" = 'bekliyor';--> statement-breakpoint
ALTER TABLE "siteler" ADD CONSTRAINT "siteler_alan_adi_unique" UNIQUE("alan_adi");--> statement-breakpoint
-- Zaten yayinda olan siteler onaylanmis sayilsin
UPDATE "siteler" SET "yayin_onayi" = coalesce("yayin_tarihi", now()) WHERE "yayinda" = true;
