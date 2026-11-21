CREATE TABLE "magaza_musterileri" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"ad" text NOT NULL,
	"eposta" text NOT NULL,
	"sifre_hash" text NOT NULL,
	"telefon" text,
	"kvkk_onay_tarihi" timestamp with time zone NOT NULL,
	"kayit_tarihi" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magaza_musteri_eposta_uniq" UNIQUE("site_id","eposta")
);
--> statement-breakpoint
CREATE TABLE "magaza_oturumlari" (
	"token" text PRIMARY KEY NOT NULL,
	"musteri_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"bitis" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "magaza_musterileri" ADD CONSTRAINT "magaza_musterileri_site_id_siteler_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."siteler"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magaza_oturumlari" ADD CONSTRAINT "magaza_oturumlari_musteri_id_magaza_musterileri_id_fk" FOREIGN KEY ("musteri_id") REFERENCES "public"."magaza_musterileri"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "magaza_oturum_musteri_idx" ON "magaza_oturumlari" USING btree ("musteri_id");