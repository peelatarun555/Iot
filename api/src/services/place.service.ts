import { hasPermissionAccess } from "@middlewares/auth.middleware";
import Place, { PlaceAccess } from "@schemas/place.schema";
import { User } from "@schemas/user.schema";
import { Permission } from "@utils/enums";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";

import { In } from "typeorm";
import { AdminPlaces, filterItems } from "@utils/admin";

export default class PlaceService {
  /**
   * Get places from user
   * @param options
   * @returns Place
   */
  public static async getPlaces(options?: {
    userId?: number;
    pagination?: { skip?: number; take?: number };
    search?: { names?: string[] };
  }): Promise<Place[]> {
    if (options?.userId != null) {
      const results = await Promise.all([
        PlaceAccess.find({
          where: {
            user: { id: options.userId },
            place:
              options?.search?.names != null && options.search.names.length > 0
                ? { name: In(options?.search?.names ?? []) }
                : undefined,
          },
          select: { place: { name: true, id: true, openAccess: true } },
          relations: { place: true },
          skip: options?.pagination?.skip ?? 0,
          take: options?.pagination?.take ?? 25,
        }),
        Place.find({
          where: {
            openAccess: true,
            name:
              options?.search?.names != null && options.search.names.length > 0
                ? In(options?.search?.names ?? [])
                : undefined,
          },
          select: { name: true, id: true, openAccess: true },
          skip: options?.pagination?.skip ?? 0,
          take: options?.pagination?.take ?? 25,
        }),
      ]);

      return this.sortPlaces(results[0].map((p) => p.place));
    } else {
      const places = await Place.find({
        where:
          options?.search?.names != null && options.search.names.length > 0
            ? { name: In(options?.search?.names ?? []) }
            : undefined,
        select: { name: true, id: true, openAccess: true },
        skip: options?.pagination?.skip ?? 0,
        take: options?.pagination?.take ?? 25,
      });

      return this.sortPlaces(places);
    }
  }

  /**
   * Loads place with its parent
   * @param placeId
   * @returns Place
   */
  public static async getPlaceWithParent(placeId: number) {
    const place = await Place.findOne({
      where: { id: placeId },
      relations: {parent: true}
    });

    if (!place) throw new NotFoundException("Place not found.");

    return place;
  }

  /**
   * Get all places
   * @param options
   * @returns AdminPlaces
   */
  public static async getAdminPlaces(options?: {
    filter?: { name?: string; parentName?: string };
    pagination?: { index?: number; take?: number };
    order?: { orderBy: string; ascending: boolean };
  }): Promise<AdminPlaces> {
    const take = options?.pagination?.take ?? 25;
    const index = options?.pagination?.index ?? 0;
    const skip = take * index;

    let dbPlaces = await Place.find({
      relations: { parent: true },
    });

    if (options?.order != null) {
      dbPlaces = this._sortAdminPlaces(
        dbPlaces,
        options.order.orderBy,
        options.order.ascending
      );
    }

    const filter = options?.filter ?? null;
    const nameFilter =
      filter?.name != null && filter.name !== "" ? filter.name : null;
    const parentNameFilter =
      filter?.parentName != null && filter.parentName !== ""
        ? filter.parentName
        : null;

    let adminPlaces: AdminPlaces;
    if (nameFilter != null || parentNameFilter != null) {
      const filteredPlaces = filterItems(
        dbPlaces,
        this._filterFunction(nameFilter, parentNameFilter),
        skip,
        take
      );
      adminPlaces = <AdminPlaces>{
        places: filteredPlaces.filteredItems,
        total: filteredPlaces.totalItemsFound,
      };
    } else if (skip <= dbPlaces.length) {
      adminPlaces = <AdminPlaces>{
        places: dbPlaces.slice(skip, skip + take),
        total: dbPlaces.length,
      };
    } else {
      adminPlaces = <AdminPlaces>{
        places: <Place[]>[],
        total: 0,
      };
    }
    adminPlaces.index = index;
    adminPlaces.take = take;
    return adminPlaces;
  }

  /**
   * Search Places by name
   * @param options
   * @returns Place
   */
  public static async searchPlaces(options: {
    userId?: number;
    searchString: string;
  }): Promise<Place[]> {
    let places: Place[];

    if (options?.userId != null) {
      const results = await Promise.all([
        PlaceAccess.find({
          where: {
            user: { id: options.userId },
          },
          select: { place: { name: true, id: true, openAccess: true } },
        }),
        Place.find({
          select: { name: true, id: true, openAccess: true },
        }),
      ]);

      places = results[0].map((p) => p.place);
    } else {
      places = await Place.find({
        select: { name: true, id: true, openAccess: true },
      });
    }
    places = places.filter((x) =>
      x.name
        .toLocaleLowerCase()
        .includes(options.searchString.toLocaleLowerCase())
    );
    return this.sortPlaces(places);
  }

  /**
   * Get place by id
   * @param placeId
   * @param name
   * @returns Place
   */
  public static async getPlace(
    placeId?: number,
    name?: string
  ): Promise<Place> {
    //find place in db
    const places = await Place.find({
      where: [{ id: placeId }, { name: name }],
      take: 1,
    });

    if (places.length != 1) {
      throw new NotFoundException(
        "Place with id '" + placeId + "' or name '" + name + "' not found"
      );
    }

    return places[0];
  }

  /**
   * Get child places from parent place
   *
   * @param parentId
   * @param pagination
   * @returns childPlaces
   */
  public static async childPlaces(
    parentId: number,
    pagination?: { skip?: number; take?: number }
  ): Promise<Place[]> {
    const places = await Place.find({
      where: { parent: { id: parentId } },
      select: { name: true, id: true },
      skip: pagination?.skip ?? 0,
      take: pagination?.take ?? 50,
    });

    return this.sortPlaces(places);
  }

  /**
   * Create a new place
   * @param name
   * @param userId
   * @param options
   * @returns Place
   */
  public static async createPlace(
    name: string,
    userId?: number,
    options?: {
      users?: { userId: number; permission: Permission }[];
      parentId?: number;
      openAccess?: boolean;
    }
  ): Promise<Place> {
    const placeAccessArray: PlaceAccess[] = [];

    const place = new Place();
    place.name = name;
    place.openAccess = options?.openAccess ?? false;

    //check if all users exist in db
    if (options && options.users && options.users.length > 0) {
      const users = await User.find({
        where: {
          id: In(
            Array.from(new Set(options.users.map((u) => u.userId)).values())
          ),
        },
        select: { id: true },
      });

      for (const user of options.users) {
        const foundUser = users.find((u) => u.id == user.userId);
        if (!foundUser) {
          throw new BadRequestException(
            "User with id " + user.userId + " does not exist."
          );
        }

        const access = new PlaceAccess();
        access.user = foundUser;
        access.permission = user.permission;
        access.place = place;
        placeAccessArray.push(access);
      }
    }

    //check for parent place
    if (options && options.parentId) {
      if (userId != null) {
        await this.checkUserPermission(
          options.parentId,
          userId,
          Permission.Write
        );
      }

      place.parent = await this.getPlace(options.parentId);
    }

    await place.save();

    //insert place access
    await PlaceAccess.insert(placeAccessArray);

    return place;
  }

  /**
   * Update a place
   * @param placeId
   * @param userId
   * @param options
   * @returns Place
   */
  public static async updatePlace(
    placeId: number,
    userId?: number,
    options?: {
      name?: string;
      users?: { userId: number; permission: Permission }[];
      parentId?: number | null;
    }
  ): Promise<Place> {
    const placeAccessArray: PlaceAccess[] = [];

    const place = await this.getPlace(placeId);

    if (options?.name) place.name = options.name;
    if (options?.parentId === place.id)
      throw new BadRequestException("Place cannot be its own parent.");

    if (options?.users && options.users.length > 0) {
      const placeAccessOld = await PlaceAccess.find({
        where: { place: { id: place.id } },
        relations: { user: true },
        select: { user: { id: true } },
      });
 
      const users = await User.find({
        where: {
          id: In(
            Array.from(new Set(options.users.map((u) => u.userId)).values())
          ),
        },
        select: { id: true },
      });

      for (const user of options.users) {
        const foundUser = users.find((u) => u.id == user.userId);
        if (!foundUser) {
          throw new BadRequestException(
            "User with id " + user.userId + " does not exist."
          );
        }

        const indexOldAccess = placeAccessOld.findIndex(
          (p) => p.user.id == foundUser.id
        );

        if (indexOldAccess < 0) {
          const access = new PlaceAccess();
          access.user = foundUser;
          access.permission = user.permission;
          access.place = place;
          placeAccessArray.push(access);
        } else {
          if (placeAccessOld[indexOldAccess].permission != user.permission) {
            placeAccessOld[indexOldAccess].permission = user.permission;
            await placeAccessOld[indexOldAccess].save();
          }
          placeAccessOld.splice(indexOldAccess, 1);
        }
      }

      //delete old placeaccess
      await Promise.all(
        placeAccessOld.map((placeAccess) =>
          PlaceAccess.delete({ id: placeAccess.id })
        )
      );
    }

    if (options?.parentId == null) {
      place.parent = null;
    } else {
      if (userId != null)
        await this.checkUserPermission(
          options.parentId,
          userId,
          Permission.Write
        );

      place.parent = await this.getPlace(options.parentId);
    }

    await place.save();

    //insert place access
    await PlaceAccess.insert(placeAccessArray);

    return place;
  }

  /**
   * Check if user has permissions of place
   * @param placeId
   * @param userId
   * @param minPermission
   */
  public static async checkUserPermission(
    placeId: number,
    userId: number,
    minPermission: Permission
  ): Promise<void> {
    const placeAccess = await PlaceAccess.findOne({
      where: { user: { id: userId }, place: { id: placeId } },
    });

    if (!placeAccess) {
      const place = await Place.findOne({
        where: { id: placeId, openAccess: true },
        select: { id: true },
      });

      if (!place) {
        throw new ForbiddenException("Access to place forbidden");
      } else {
        if (!hasPermissionAccess(Permission.Read, minPermission)) {
          throw new ForbiddenException("Access to place forbidden");
        }
        return;
      }
    }

    if (!hasPermissionAccess(placeAccess.permission, minPermission)) {
      throw new ForbiddenException("Access to place forbidden");
    }
  }

  /**
   * Delete place
   * @param placeId
   */
  public static async deletePlace(placeId: number): Promise<boolean> {
    const result = await Place.delete({ id: placeId });

    if (result.affected != 1) {
      throw new NotFoundException(
        "Can not delete place: place not found id " + placeId
      );
    }

    return true;
  }

  public static sortPlaces(places: Place[]) {
    return places.sort((a: Place, b: Place) => a.name.localeCompare(b.name));
  }

  private static _sortAdminPlaces(
    places: Place[],
    orderBy: string,
    ascending: boolean
  ): Place[] {
    return places.sort((a: Place, b: Place) => {
      let propA: string | number = 0;
      let propB: string | number = 0;
      switch (orderBy) {
        case "name":
          propA = a.name;
          propB = b.name;
          break;
        case "parent":
          propA = a.parent?.name ?? "";
          propB = b.parent?.name ?? "";
          break;
        case "id":
          propA = a.id;
          propB = b.id;
          break;
      }
      if (ascending) return propA < propB ? -1 : 1;
      return propA > propB ? -1 : 1;
    });
  }

  private static _filterFunction(
    name: string | null,
    parentName: string | null
  ): (place: Place) => boolean {
    if (name != null && parentName != null)
      return (place: Place) =>
        place.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()) &&
        (place.parent?.name
          .toLocaleLowerCase()
          .includes(parentName!.toLocaleLowerCase()) ??
          false);
    else if (name != null)
      return (place: Place) =>
        place.name.toLocaleLowerCase().includes(name.toLocaleLowerCase());
    else
      return (place: Place) =>
        place.parent?.name
          .toLocaleLowerCase()
          .includes(parentName!.toLocaleLowerCase()) ?? false;
  }
}
