import { SensorDataType } from "@utils/enums";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Device from "./device.schema";
import Project from "./project.schema";

@Entity({ name: "sensor_types" })
export class SensorType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ length: 32, unique: true, name: "name" })
  name!: string;

  @Column({
    type: "enum",
    enum: SensorDataType,
    default: SensorDataType.number,
    name: "type"
  })
  type!: SensorDataType;
}

@Entity({ name: "sensors" })
export default class Sensor extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  @Index({ unique: true })
  id!: number;

  @Column({ length: 32, name: "name" })
  name!: string;

  @Column({ length: 32, nullable: true, name: "library_id" })
  @Index({ unique: true, where: "library_id IS NOT NULL" })
  libraryId?: string;

  @Column({ length: 32, nullable: true, name: "alias" })
  alias?: string;

  @Column({ type: "timestamp", nullable: true, name: "deleted_at" })
  deletedAt?: Date | null;

  @ManyToOne(() => SensorType, (sensorType) => sensorType.id, {
    nullable: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "sensor_type_id" })
  sensorType!: SensorType;

  @ManyToOne(() => Device, (device) => device.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "device_id" })
  device!: Device;

  @ManyToMany(() => Project, { cascade: true })
  @JoinTable({
    name: "project_sensors",
    joinColumn: { 
      name: "project_id", 
      referencedColumnName: "id" 
    },
    inverseJoinColumn: { 
      name: "sensor_id", 
      referencedColumnName: "id" 
    },
  })
  projects!: Project[];
}
