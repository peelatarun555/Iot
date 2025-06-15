import { BaseEntity, Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "datapoints" })
@Index(["sensorId", "timestamp"], { unique: true })
export class Datapoint extends BaseEntity {
  @PrimaryColumn({ type: "int", name: "sensor_id" })
  sensorId!: number;

  @PrimaryColumn({ type: "timestamptz", name: "timestamp" })
  timestamp!: Date;

  @Column({ type: "float", nullable: true, name: "value" })
  value?: number;

  @Column({ type: "simple-json", nullable: true, name: "value_string" })
  valueString?: string;

  constructor(options?: {
    timestamp: Date;
    sensorId: number;
    value?: number;
    valueString?: string;
  }) {
    super();
    if (options) {
      this.timestamp = options.timestamp;
      this.sensorId = options.sensorId;
      this.value = options.value;
      this.valueString = options.valueString;
    }
  }
}
