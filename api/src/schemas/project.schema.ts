import { Permission } from "@utils/enums";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Sensor from "./sensor.schema";
import { User } from "@schemas/user.schema"; // Changed to named import

@Entity("projects")
export default class Project extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ length: 32, unique: true, name: "name" })
  name!: string;

  @OneToMany(() => ProjectAccess, (projectAccess) => projectAccess.project)
  projectAccess!: ProjectAccess[];

  @ManyToMany(() => Sensor, { cascade: true })
  @JoinTable({
    name: "project_sensors",
    joinColumn: { name: "project_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "sensor_id", referencedColumnName: "id" },
  })
  sensors!: Sensor[];
}

@Entity({ name: "project_access" })
@Index(["project", "user"], { unique: true })
export class ProjectAccess extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @ManyToOne(() => User, (user) => user.projectAccesses, { // Fixed relation
    cascade: true,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Project, (project) => project.projectAccess, {
    cascade: true,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ 
    type: "enum", 
    enum: Permission, 
    default: Permission.Read,
    name: "permission"
  })
  permission!: Permission;
}
