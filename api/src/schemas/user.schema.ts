import { Role } from "@utils/enums";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlaceAccess } from "./place.schema";
import { ProjectAccess } from "./project.schema";
import * as bcrypt from "bcryptjs";


@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ length: 32, name: "firstname" })
  firstName!: string;

  @Column({ length: 32, name: "lastname" })
  lastName!: string;

  @Column({ length: 64, unique: true, name: "email" })
  @Index({ unique: true })
  email!: string;

  @Column({ length: 72, nullable: true, name: "password" })
  password?: string;

  @Column({ length: 16, nullable: true, name: "password_tmp" })
  temporaryPassword?: string;

  @Column({
    type: "timestamptz",
    nullable: true,
    name: "last_password_reset_at",
  })
  lastPasswordResetAt?: Date;

  @Column({ type: "timestamptz", name: "registered_at" })
  registeredAt!: Date;

  @Column({ 
    type: "enum",
    enum: Role,
    default: Role.User,
    name: "role"
  })
  role!: Role;

  @OneToMany(() => ProjectAccess, (projectAccess) => projectAccess.user)
  projectAccesses!: ProjectAccess[];

  @OneToMany(() => PlaceAccess, (placeAccess) => placeAccess.user)
  placeAccesses!: PlaceAccess[];

  // Automatically hash password before new user insertion
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await User.hashPassword(this.password);
    }
  }

  // Password comparison method
  async comparePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  // Static method for password hashing
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
 