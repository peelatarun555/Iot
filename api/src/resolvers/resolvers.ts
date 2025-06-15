import { DatapointResolver } from "./datapoint.resolver";
import { DatasourceResolver } from "./datasource.resolver";
import { DeviceResolver } from "./device.resolvers";
import { PlaceResolver } from "./place.resolver";
import { ProjectResolver } from "./project.resolver";
import { SensorResolver } from "./sensor.resolvers";
import { UserResolver } from "./user.resolver";

export const resolvers = [
  UserResolver,
  ProjectResolver,
  DeviceResolver,
  SensorResolver,
  PlaceResolver,
  DatasourceResolver,
  DatapointResolver,
] as const;
