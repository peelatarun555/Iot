import { hasRoleAccess } from "@middlewares/auth.middleware";
import CurrentUser from "@middlewares/user.middleware";
import Device, { DeviceType } from "@schemas/device.schema";
import Place from "@schemas/place.schema";
import Sensor from "@schemas/sensor.schema";
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { SensorService } from "@services/sensor.service";
import { Permission, Role } from "@utils/enums";
import { ForbiddenGraphException } from "@utils/exceptions/restapi.exception";
import { ContextUser } from "@utils/interfaces/context.interface";
import {
  DeviceCreateArgs,
  DeviceCreateInput,
  DeviceGetArgs,
  DeviceGetOptionsInput,
  DeviceGetPaginationInput,
  DevicesGetFilterArgs,
  DevicesGetOrderArgs,
  DevicesGetPaginationArgs,
  DeviceUpdateInput,
} from "@validations/device.validation";
import {
  Arg,
  Args,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { AdminDevices } from "@utils/admin";

@Resolver(() => Device)
export class DeviceResolver {
  @Authorized(Role.moderator)
  @FieldResolver(() => Place)
  place(@Root() device: Device): Promise<Place> {
    return DeviceService.getPlaceFromDevice(device.id);
  }

  @FieldResolver(() => [Sensor])
  sensors(@Root() device: Device): Promise<Sensor[]> {
    return SensorService.getSensors({ deviceId: device.id });
  }

  @Authorized(Role.admin)
  @Query(() => [DeviceType])
  deviceTypes(): Promise<DeviceType[]> {
    return DeviceService.getDeviceTypes();
  }

  @Authorized(Role.default)
  @Query(() => [Device])
  devices(
    @CurrentUser() user: ContextUser,
    @Arg("pagination", { nullable: true })
    pagination?: DeviceGetPaginationInput,
    @Arg("options", { nullable: true }) options?: DeviceGetOptionsInput
  ): Promise<Device[]> {
    if (options?.deleted && user.role != Role.admin) {
      throw new ForbiddenGraphException(
        "You are not allowed to get deleted devices"
      );
    }

    return DeviceService.getDevices({
      pagination: pagination,
      userId: user.role != Role.admin ? user.id : undefined,
      deleted: options?.deleted,
    });
  }

  @Authorized(Role.admin)
  @Query(() => AdminDevices)
  adminDevices(
    @Arg("filter", { nullable: true }) filter?: DevicesGetFilterArgs,
    @Arg("pagination", { nullable: true })
    pagination?: DevicesGetPaginationArgs,
    @Arg("order", { nullable: true }) order?: DevicesGetOrderArgs
  ): Promise<AdminDevices> {
    return DeviceService.getAdminDevices({
      filter,
      pagination,
      order,
    });
  }

  @Authorized(Role.default)
  @Query(() => [Place])
  searchDevices(
    @CurrentUser() user: ContextUser,
    @Arg("searchString", { nullable: true }) searchString: string
  ): Promise<Device[]> {
    return DeviceService.searchDevices({
      userId: user.role != Role.admin ? user.id : undefined,
      searchString,
    });
  }

  @Authorized(Role.default)
  @Query(() => Device)
  async device(
    @Args() { id }: DeviceGetArgs,
    @CurrentUser() user: ContextUser
  ): Promise<Device> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await DeviceService.checkUserPermission(id, user.id, Permission.read);
    }

    return DeviceService.getDevice(id);
  }

  @Authorized(Role.moderator)
  @Mutation(() => Device)
  async createDevice(
    @Args()
    { name, deviceType, devEui, status, placeId }: DeviceCreateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options?: DeviceCreateInput
  ): Promise<Device> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await PlaceService.checkUserPermission(
        placeId,
        user.id,
        Permission.write
      );
    }

    return DeviceService.createDevice(
      name,
      devEui,
      deviceType,
      status,
      placeId,
      options
    );
  }

  @Authorized(Role.moderator)
  @Mutation(() => Device)
  async updateDevice(
    @Args() { id }: DeviceGetArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options?: DeviceUpdateInput
  ): Promise<Device> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await DeviceService.checkUserPermission(id, user.id, Permission.write);
    }

    return DeviceService.updateDevice(
      id,
      user.role == Role.admin ? undefined : user.id,
      options
    );
  }

  @Authorized(Role.moderator)
  @Mutation(() => Boolean)
  async deleteDevice(
    @Args() { id }: DeviceGetArgs,
    @CurrentUser() user: ContextUser
  ): Promise<boolean> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await DeviceService.checkUserPermission(id, user.id, Permission.write);
    } else {
      await DeviceService.getDevice(id);
    }

    return DeviceService.softDeleteDevice(id);
  }

  @Authorized(Role.moderator)
  @Mutation(() => Boolean)
  async deleteDeviceHard(
    @Args() { id }: DeviceGetArgs,
    @CurrentUser() user: ContextUser
  ): Promise<boolean> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      throw new ForbiddenGraphException(
        "Only superadmins are allowed to hard delete a device."
      );
    } else {
      await DeviceService.getDevice(id, true);
    }

    return DeviceService.hardDeleteDevice(id);
  }

  @Authorized(Role.admin)
  @Mutation(() => Device)
  async undoDeleteDevice(@Args() { id }: DeviceGetArgs): Promise<Device> {
    return DeviceService.undoSoftDeleteDevice(id);
  }
}
