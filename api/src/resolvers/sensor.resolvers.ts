import { hasRoleAccess } from "@middlewares/auth.middleware";
import CurrentUser from "@middlewares/user.middleware";
import { Datapoint } from "@schemas/datapoint.schema";
import Device from "@schemas/device.schema";
import Sensor, { SensorType } from "@schemas/sensor.schema";
import { DatapointService } from "@services/datapoint.service";
import { DeviceService } from "@services/device.service";
import { SensorService } from "@services/sensor.service";
import { Permission, Role } from "@utils/enums";
import { ContextUser } from "@utils/interfaces/context.interface";
import { DatapointGetPaginationInput, DatapointsGetOptionInput } from "@validations/datapoint.validation";
import {
  SensorCreateArgs,
  SensorCreateInput,
  SensorDeleteArgs,
  SensorGetArgs,
  SensorGetPaginationInput,
  SensorsGetFilterArgs,
  SensorsGetOrderArgs,
  SensorsGetPaginationArgs,
  SensorUpdateArgs,
  SensorUpdateInput,
} from "@validations/sensor.validation";
import { Arg, Args, Authorized, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { AdminSensors } from "@utils/admin";

@Resolver(() => Sensor)
export class SensorResolver {
  @FieldResolver(() => [Datapoint])
  data(
    @Root() sensor: Sensor,
    @Arg("options", { nullable: true }) options?: DatapointsGetOptionInput,
    @Arg("pagination", { nullable: true })
      pagination?: DatapointGetPaginationInput,
  ): Promise<Datapoint[]> {
    return DatapointService.getDatapoints({
      sensorId: sensor.id,
      pagination,
      options,
    });
  }

  @FieldResolver(() => Device)
  async device(@Root() sensor: Sensor): Promise<Device> {
    return SensorService.getDeviceFromSensor(sensor.id);
  }

  @Authorized(Role.default)
  @Query(() => [Sensor])
  sensors(
    @CurrentUser() user: ContextUser,
    @Arg("pagination", { nullable: true })
      pagination?: SensorGetPaginationInput,
  ): Promise<Sensor[]> {
    return SensorService.getSensors({
      pagination: pagination,
      userId: user.role != Role.admin ? user.id : undefined,
    });
  }

  @Authorized(Role.admin)
  @Query(() => AdminSensors)
  adminSensors(
    @Arg("filter", { nullable: true }) filter?: SensorsGetFilterArgs,
    @Arg("pagination", { nullable: true })
      pagination?: SensorsGetPaginationArgs,
    @Arg("order", { nullable: true }) order?: SensorsGetOrderArgs,
  ): Promise<AdminSensors> {
    return SensorService.getAdminSensors({
      filter,
      pagination,
      order,
    });
  }

  @Authorized(Role.admin)
  @Query(() => [Sensor])
  searchSensors(
    @Arg("searchString", { nullable: true }) searchString: string,
  ): Promise<Sensor[]> {
    return SensorService.searchSensors(
      searchString,
    );
  }

  @Authorized(Role.default)
  @Query(() => [SensorType])
  sensorTypes(): Promise<SensorType[]> {
    return SensorService.getSensorTypes();
  }

  @Authorized(Role.default)
  @Query(() => Sensor)
  async sensor(
    @Args() { id }: SensorGetArgs,
    @CurrentUser() user: ContextUser,
  ): Promise<Sensor> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(id, user.id, Permission.read);
    }

    return SensorService.getSensor(id);
  }

  @Authorized(Role.moderator)
  @Mutation(() => Sensor)
  async createSensor(
    @Args() { name, sensorType, deviceId }: SensorCreateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options?: SensorCreateInput,
  ): Promise<Sensor> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await DeviceService.checkUserPermission(
        deviceId,
        user.id,
        Permission.write,
      );
    }

    return SensorService.createSensor(name, sensorType, deviceId, options);
  }

  @Authorized(Role.moderator)
  @Mutation(() => Sensor)
  async updateSensor(
    @Args() { id }: SensorUpdateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options?: SensorUpdateInput,
  ): Promise<Sensor> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(id, user.id, Permission.write);
    }

    return SensorService.updateSensor(id, options);
  }

  @Authorized(Role.moderator)
  @Mutation(() => Boolean)
  async deleteSensor(
    @Args() { id }: SensorDeleteArgs,
    @CurrentUser() user: ContextUser,
  ): Promise<boolean> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(id, user.id, Permission.write);
    } else {
      await SensorService.getSensor(id);
    }

    return SensorService.deleteSensor(id);
  }
}
