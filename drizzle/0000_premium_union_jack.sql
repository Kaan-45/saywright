CREATE TABLE "kullanicilar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ad" text NOT NULL,
	"eposta" text NOT NULL,
	"sifre_hash" text NOT NULL,
	"plan" text DEFAULT 'ucretsiz' NOT NULL,
	"olusturulan_site_sayisi" integer DEFAULT 0 NOT NULL,
	"kayit_tarihi" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kullanicilar_eposta_unique" UNIQUE("eposta")
);
--> statement-breakpoint
CREATE TABLE "oturumlar" (
	"token" text PRIMARY KEY NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"bitis" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "siteler" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"ayarlar" jsonb,
	"mesajlar" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"yapay_zeka_mesaj_sayisi" integer DEFAULT 0 NOT NULL,
	"olusturma" timestamp with time zone DEFAULT now() NOT NULL,
	"guncelleme" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oturumlar" ADD CONSTRAINT "oturumlar_kullanici_id_kullanicilar_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanicilar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siteler" ADD CONSTRAINT "siteler_kullanici_id_kullanicilar_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanicilar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oturumlar_kullanici_idx" ON "oturumlar" USING btree ("kullanici_id");--> statement-breakpoint
CREATE INDEX "siteler_kullanici_idx" ON "siteler" USING btree ("kullanici_id");