import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "locations" })
export default class Location extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ nullable: false, name: "latitude" })
  latitude!: number;

  @Column({ nullable: false, name: "longitude" })
  longitude!: number;

  @Column({ nullable: true, name: "altitude" })
  altitude?: number;
}
