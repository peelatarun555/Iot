import { hasRoleAccess } from "@middlewares/auth.middleware";
import CurrentUser from "@middlewares/user.middleware";
import Device from "@schemas/device.schema";
import Place from "@schemas/place.schema";
import Sensor from "@schemas/sensor.schema";
import User from "@schemas/user.schema"; 
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { SensorService } from "@services/sensor.service";
import { UserService } from "@services/user.service";
import { Permission, Role } from "@utils/enums";
import { BadRequestException } from "@utils/exceptions/restapi.exception";
import { ContextUser } from "@utils/interfaces/context.interface";
import {
  PlaceCreateArgs,
  PlaceCreateInput,
  PlaceDeleteArgs,
  PlaceGetArgs,
  PlaceGetPaginationInput,
  PlacesGetFilterArgs,
  PlacesGetOrderArgs,
  PlacesGetPaginationArgs,
  PlacesGetSearchArgs,
  PlaceUpdateArgs,
  PlaceUpdateInput,
} from "@validations/place.validation";
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
import { AdminPlaces } from "@utils/admin";

@Resolver(() => Place)
export class PlaceResolver {
  @Authorized(Role.default)
  @FieldResolver(() => [Device])
  devices(@Root() place: Place): Promise<Device[]> {
    return DeviceService.getDevices({ placeId: place.id });
  }

  @Authorized(Role.default)
  @FieldResolver(() => [Sensor])
  sensors(
    @Root() place: Place,
    @CurrentUser() user: ContextUser
  ): Promise<Sensor[]> {
    return SensorService.getSensors({
      userId: user.role == Role.admin ? undefined : user.id,
      placeId: place.id,
    });
  }

  @Authorized(Role.default)
  @FieldResolver(() => Place, { nullable: true })
  async parent(@Root() place: Place): Promise<Place | null> {
    const placeWithParent = await Place.findOne({
      where: { id: place.id },
      relations: { parent: true },
    });
    return placeWithParent?.parent ?? null;
  }

  @Authorized(Role.admin)
  @FieldResolver(() => [User])
  users(@Root() place: Place): Promise<User[]> {
    return UserService.getUsers({ placeId: place.id });
  }

  @Authorized(Role.default)
  @FieldResolver(() => [Place])
  childPlaces(@Root() place: Place): Promise<Place[]> {
    return PlaceService.childPlaces(place.id);
  }

  @Authorized(Role.default)
  @Query(() => [Place])
  places(
    @CurrentUser() user: ContextUser,
    @Arg("pagination", { nullable: true }) pagination?: PlaceGetPaginationInput,
    @Arg("search", { nullable: true }) search?: PlacesGetSearchArgs
  ): Promise<Place[]> {
    return PlaceService.getPlaces({
      pagination: pagination,
      userId: user.role != Role.admin ? user.id : undefined,
      search: { names: search?.names },
    });
  }

  @Authorized(Role.admin)
  @Query(() => AdminPlaces)
  adminPlaces(
    @Arg("filter", { nullable: true }) filter?: PlacesGetFilterArgs,
    @Arg("pagination", { nullable: true }) pagination?: PlacesGetPaginationArgs,
    @Arg("order", { nullable: true }) order?: PlacesGetOrderArgs
  ): Promise<AdminPlaces> {
    return PlaceService.getAdminPlaces({
      filter,
      pagination,
      order,
    });
  }

  @Authorized(Role.default)
  @Query(() => [Place])
  searchPlaces(
    @CurrentUser() user: ContextUser,
    @Arg("searchString", { nullable: true }) searchString: string
  ): Promise<Place[]> {
    return PlaceService.searchPlaces({
      userId: user.role != Role.admin ? user.id : undefined,
      searchString,
    });
  }

  @Authorized(Role.default)
  @Query(() => Place)
  async place(
    @Args() { id, name }: PlaceGetArgs,
    @CurrentUser() user: ContextUser
  ): Promise<Place> {
    const place = await PlaceService.getPlace(id, name);

    //check user access for place
    if (!hasRoleAccess(user.role, Role.admin)) {
      await PlaceService.checkUserPermission(
        place.id,
        user.id,
        Permission.read
      );
    }

    return place;
  }

  @Authorized(Role.moderator)
  @Mutation(() => Place)
  createPlace(
    @Args() { name }: PlaceCreateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options?: PlaceCreateInput
  ): Promise<Place> {
    return PlaceService.createPlace(
      name,
      user.role != Role.admin ? user.id : undefined,
      options
    );
  }

  @Authorized(Role.moderator)
  @Mutation(() => Place)
  updatePlace(
    @Args() { id }: PlaceUpdateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options?: PlaceUpdateInput
  ): Promise<Place> {
    return PlaceService.updatePlace(
      id,
      user.role != Role.admin ? user.id : undefined,
      options
    );
  }

  @Authorized(Role.moderator)
  @Mutation(() => Boolean)
  async deletePlace(
    @Args() { id }: PlaceDeleteArgs,
    @CurrentUser() user: ContextUser
  ): Promise<boolean> {
    //check user access for place
    if (!hasRoleAccess(user.role, Role.admin)) {
      await PlaceService.checkUserPermission(id, user.id, Permission.admin);
    } else {
      await PlaceService.getPlace(id);
    }

    if ((await Device.findOneBy({ place: { id: id } })) != null) {
      throw new BadRequestException(
        "There are devices registered in the place, remove them first"
      );
    }

    if ((await Place.findOneBy({ parent: { id: id } })) != null) {
      throw new BadRequestException(
        "The place contains child places, remove them first"
      );
    }

    return PlaceService.deletePlace(id);
  }
}
