import { DeviceStatus } from "@utils/enums";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Location from "./location.schema";
import Place from "./place.schema";
import Sensor from "./sensor.schema";

@Entity({ name: "device_types" })
export class DeviceType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ length: 32, unique: true, name: "name" })
  name!: string;
}

@Entity({ name: "devices" })
export default class Device extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  @Index({ unique: true })
  id!: number;

  @Column({ length: 32, name: "name" })
  name!: string;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.id, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: "device_type_id" })
  deviceType!: DeviceType; // Changed to strict entity reference

  @Index({ unique: true })
  @Column({ length: 32, unique: true, name: "dev_eui" })
  devEui!: string;

  @Column({ length: 256, nullable: true, name: "description" })
  description?: string;

  @Column({ 
    type: "enum", 
    enum: DeviceStatus, 
    name: "status" 
  })
  status!: DeviceStatus;

  @Column({
    type: "timestamp",
    name: "created_at",
  })
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true, name: "deleted_at" })
  deletedAt?: Date | null;

  @ManyToOne(() => Place, (place) => place.id, { nullable: false })
  @JoinColumn({ name: "place_id" })
  place!: Place;

  @OneToOne(() => Location, { nullable: true })
  @JoinColumn({ name: "location_id" })
  location?: Location;

  @OneToMany(() => Sensor, (sensor) => sensor.device, {
    cascade: true,
    nullable: false,
  })
  sensors!: Sensor[];
}
