import { UserStatus } from "@enums/user-status.enum.ts";
import { Check, Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity("users")
@Unique("uq_users_email_canonical", ["emailCanonical"])
@Check("ck_users_status", `"status" IN ('active', 'inactive', 'pending_verification', 'frozen', 'deleted')`)
@Check("ck_users_active_verified", `"status" <> 'active' OR "email_verified_at" IS NOT NULL`)
@Check("ck_users_pending_unverified", `"status" <> 'pending_verification' OR "email_verified_at" IS NULL`)
@Check("ck_users_deleted_at", `("status" = 'deleted') = ("deleted_at" IS NOT NULL)`)
@Check("ck_users_email_ascii", `("email" COLLATE "C") ~ '^[!-~]+$'`)
@Check("ck_users_email_canonical", `"email_canonical" = lower("email" COLLATE "C")`)
export class User {
  // The creating service supplies crypto.randomUUID(); loading a row must not generate an identity.
  @PrimaryColumn({ type: "uuid", primaryKeyConstraintName: "pk_users" })
  id: string;

  @Column({ type: "varchar", length: 254 })
  email: string;

  @Column({ name: "email_canonical", type: "varchar", length: 254, collation: "C" })
  emailCanonical: string;

  // Keep PostgreSQL storage as checked strings, rather than a database enum type.
  @Column({ type: "varchar", length: 32, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ name: "email_verified_at", type: "timestamptz", precision: 3, nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: "created_at", type: "timestamptz", precision: 3, default: () => "CURRENT_TIMESTAMP(3)" })
  createdAt: Date;

  // This default applies on insert. The service explicitly maintains later updates.
  @Column({ name: "updated_at", type: "timestamptz", precision: 3, default: () => "CURRENT_TIMESTAMP(3)" })
  updatedAt: Date;

  // An ordinary column keeps account-state filtering explicit in authentication queries.
  @Column({ name: "deleted_at", type: "timestamptz", precision: 3, nullable: true })
  deletedAt: Date | null;
}
