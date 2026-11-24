import { Check, Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { User } from "./user.entity.js";

@Entity("password_credentials")
@Check("ck_password_hash_not_null", "password_hash <> ''")
export class PasswordCredential {
  @PrimaryColumn({ name: "user_id", type: "uuid", primaryKeyConstraintName: "pk_password_credentials" })
  @ForeignKey(() => User, "id", {
    name: "fk_password_credentials_user_id",
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  userId: string;

  // Full encoded Argon2id hash, cannot be selected by default to avoid accidental exposure.
  @Column({ name: "password_hash", type: "text", select: false })
  passwordHash: string;

  @Column({ name: "created_at", type: "timestamptz", precision: 3, default: () => "CURRENT_TIMESTAMP(3)" })
  createdAt: Date;

  @Column({ name: "password_changed_at", type: "timestamptz", precision: 3, nullable: true })
  passwordChangedAt: Date | null;
}
