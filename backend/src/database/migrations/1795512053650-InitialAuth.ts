import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialAuth1795512053650 implements MigrationInterface {
  name = "InitialAuth1795512053650";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "email" character varying(254) NOT NULL, "email_canonical" character varying(254) COLLATE "C" NOT NULL, "status" character varying(32) NOT NULL DEFAULT 'pending_verification', "email_verified_at" TIMESTAMP(3) WITH TIME ZONE, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, CONSTRAINT "uq_users_email_canonical" UNIQUE ("email_canonical"), CONSTRAINT "ck_users_email_canonical" CHECK ("email_canonical" = lower("email" COLLATE "C")), CONSTRAINT "ck_users_email_ascii" CHECK (("email" COLLATE "C") ~ '^[!-~]+$'), CONSTRAINT "ck_users_deleted_at" CHECK (("status" = 'deleted') = ("deleted_at" IS NOT NULL)), CONSTRAINT "ck_users_pending_unverified" CHECK ("status" <> 'pending_verification' OR "email_verified_at" IS NULL), CONSTRAINT "ck_users_active_verified" CHECK ("status" <> 'active' OR "email_verified_at" IS NOT NULL), CONSTRAINT "ck_users_status" CHECK ("status" IN ('active', 'inactive', 'pending_verification', 'frozen', 'deleted')), CONSTRAINT "pk_users" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "password_credentials" ("user_id" uuid NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "password_changed_at" TIMESTAMP(3) WITH TIME ZONE, CONSTRAINT "ck_password_hash_not_null" CHECK (password_hash <> ''), CONSTRAINT "pk_password_credentials" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "credential_digest" character varying(64) NOT NULL, "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "last_seen_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "idle_expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "absolute_expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP(3) WITH TIME ZONE, CONSTRAINT "uq_sessions_credential_digest" UNIQUE ("credential_digest"), CONSTRAINT "ck_finite_timestamps" CHECK (isfinite(created_at) AND isfinite(last_seen_at) AND isfinite(idle_expires_at)
		AND isfinite(absolute_expires_at) AND (revoked_at IS NULL OR isfinite(revoked_at))
	), CONSTRAINT "ck_sessions_digest_hex" CHECK (credential_digest ~ '^[0-9a-f]{64}$'), CONSTRAINT "ck_sessions_revocation" CHECK (revoked_at IS NULL OR revoked_at >= created_at), CONSTRAINT "ck_sessions_lifecycle" CHECK (created_at <= last_seen_at AND last_seen_at < idle_expires_at AND idle_expires_at <= absolute_expires_at), CONSTRAINT "pk_sessions" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "idx_sessions_user_id" ON "sessions"  ("user_id") `);
    await queryRunner.query(
      `ALTER TABLE "password_credentials" ADD CONSTRAINT "fk_password_credentials_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "fk_sessions_user_id"`);
    await queryRunner.query(`ALTER TABLE "password_credentials" DROP CONSTRAINT "fk_password_credentials_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_sessions_user_id"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "password_credentials"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
