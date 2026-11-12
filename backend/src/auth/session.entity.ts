import { Check, Column, Entity, ForeignKey, Index, PrimaryColumn, Unique } from "typeorm";
import { User } from "./user.entity.js";

@Entity("sessions")
@Unique("uq_sessions_credential_digest", ["credentialDigest"])
@Check(
  "ck_sessions_lifecycle",
  `created_at <= last_seen_at AND last_seen_at < idle_expires_at AND idle_expires_at <= absolute_expires_at`,
)
@Check("ck_sessions_revocation", "revoked_at IS NULL OR revoked_at >= created_at")
@Check("ck_sessions_digest_hex", "credential_digest ~ '^[0-9a-f]{64}$'")
@Check(
  "ck_finite_timestamps",
  `isfinite(created_at) AND isfinite(last_seen_at) AND isfinite(idle_expires_at)
		AND isfinite(absolute_expires_at) AND (revoked_at IS NULL OR isfinite(revoked_at))
	`,
)
export class Session {
  @PrimaryColumn({ type: "uuid", primaryKeyConstraintName: "pk_sessions" })
  id: string;

  @Index("idx_sessions_user_id")
  @Column({ name: "user_id", type: "uuid" })
  @ForeignKey(() => User, "id", {
    name: "fk_sessions_user_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  userId: string;

  @Column({ name: "credential_digest", type: "varchar", length: 64, select: false })
  credentialDigest: string;

  @Column({ name: "created_at", type: "timestamptz", precision: 3, default: () => "CURRENT_TIMESTAMP(3)" })
  createdAt: Date;

  @Column({ name: "last_seen_at", type: "timestamptz", precision: 3 })
  lastSeenAt: Date;

  @Column({ name: "idle_expires_at", type: "timestamptz", precision: 3 })
  idleExpiresAt: Date;

  @Column({ name: "absolute_expires_at", type: "timestamptz", precision: 3 })
  absoluteExpiresAt: Date;

  @Column({ name: "revoked_at", type: "timestamptz", precision: 3, nullable: true })
  revokedAt: Date | null;
}
