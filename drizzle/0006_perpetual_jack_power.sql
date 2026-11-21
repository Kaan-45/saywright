CREATE TABLE "eposta_dogrulamalari" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"kullanici_id" uuid NOT NULL,
	"bitis" timestamp with time zone NOT NULL,
	"olusturma" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kullanicilar" ADD COLUMN "eposta_dogrulandi" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "eposta_dogrulamalari" ADD CONSTRAINT "eposta_dogrulamalari_kullanici_id_kullanicilar_id_fk" FOREIGN KEY ("kullanici_id") REFERENCES "public"."kullanicilar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eposta_dogrulama_kullanici_idx" ON "eposta_dogrulamalari" USING btree ("kullanici_id");--> statement-breakpoint
-- Bu ozellikten ONCE kayit olmus hesaplar dogrulanmis sayilsin (kilitlenmesinler)
UPDATE "kullanicilar" SET "eposta_dogrulandi" = now() WHERE "eposta_dogrulandi" IS NULL;
