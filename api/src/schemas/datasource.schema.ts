import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "datasources" })
export class Datasource extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ length: 32, unique: true, name: "name" })
  name!: string;

  @Column({ length: 128, unique: true, name: "token" })
  token!: string;

  @Column({ name: "expires_at" })
  expiresAt!: Date;
}
