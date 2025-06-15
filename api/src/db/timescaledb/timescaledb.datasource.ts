import { Datapoint } from "@schemas/datapoint.schema";
import { Datasource } from "@schemas/datasource.schema";
import Device, { DeviceType } from "@schemas/device.schema";
import Location from "@schemas/location.schema";
import Place, { PlaceAccess } from "@schemas/place.schema";
import Project, { ProjectAccess } from "@schemas/project.schema";
import Sensor, { SensorType } from "@schemas/sensor.schema";
import { User } from "@schemas/user.schema";
import { env, isTestEnv } from "@utils/env";
import { DataSource } from "typeorm";

//this is the query to convert a table to a hypertable
//await queryRunner.query("SELECT create_hypertable('datapoint', 'timestamp');");

export const datasource = new DataSource({
  type: "postgres",
  ssl: env.POSTGRES_SSL
    ? {
        rejectUnauthorized: false,
        requestCert: true,
      }
    : false,
  host: env.POSTGRES_HOST,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: env.POSTGRES_PORT,
  dropSchema: isTestEnv(),
  migrations: [__dirname + "/migration/**"],
  entities: [
    Datapoint,
    User,
    Place,
    PlaceAccess,
    Project,
    ProjectAccess,
    DeviceType,
    SensorType,
    Device,
    Sensor,
    Datasource,
    Location,
  ],
  synchronize: false,
  migrationsRun: true,
  logging: false,
  logger: "simple-console",
});
