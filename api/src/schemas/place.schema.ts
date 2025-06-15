import { Permission } from "@utils/enums";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Device from "./device.schema";
import { User } from "@schemas/user.schema"; // Fixed import

@Entity({ name: "places" })
export default class Place extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  @Index({ unique: true })
  id!: number;

  @Column({ length: 64, unique: true, name: "name" })
  @Index({ unique: true })
  name!: string;

  @Column({ default: false, name: "open_access" })
  openAccess!: boolean;

  @ManyToOne(() => Place, (place) => place.id, {
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent?: Place | null;

  @OneToMany(() => PlaceAccess, (placeAccess) => placeAccess.place)
  placeAccess!: PlaceAccess[];

  @OneToMany(() => Device, (device) => device.place)
  devices!: Device[];
}

@Entity({ name: "place_access" })
@Index(["user", "place"], { unique: true })
export class PlaceAccess extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @ManyToOne(() => User, (user) => user.placeAccesses, { // Fixed relation
    cascade: true,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Place, (place) => place.placeAccess, {
    cascade: true,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "place_id" })
  place!: Place;

  @Column({
    type: "enum",
    enum: Permission,
    default: Permission.Read,
    name: "permission",
  })
  permission!: Permission;
}
