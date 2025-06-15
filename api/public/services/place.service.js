"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("@middlewares/auth.middleware");
const place_schema_1 = __importStar(require("@schemas/place.schema"));
const user_schema_1 = __importDefault(require("@schemas/user.schema"));
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const typeorm_1 = require("typeorm");
const admin_1 = require("@utils/admin");
class PlaceService {
    static async getPlaces(options) {
        if (options?.userId != null) {
            const results = await Promise.all([
                place_schema_1.PlaceAccess.find({
                    where: {
                        user: { id: options.userId },
                        place: options?.search?.names != null && options.search.names.length > 0
                            ? { name: (0, typeorm_1.In)(options?.search?.names ?? []) }
                            : undefined,
                    },
                    select: { place: { name: true, id: true, openAccess: true } },
                    relations: { place: true },
                    skip: options?.pagination?.skip ?? 0,
                    take: options?.pagination?.take ?? 25,
                }),
                place_schema_1.default.find({
                    where: {
                        openAccess: true,
                        name: options?.search?.names != null && options.search.names.length > 0
                            ? (0, typeorm_1.In)(options?.search?.names ?? [])
                            : undefined,
                    },
                    select: { name: true, id: true, openAccess: true },
                    skip: options?.pagination?.skip ?? 0,
                    take: options?.pagination?.take ?? 25,
                }),
            ]);
            return this.sortPlaces(results[0].map((p) => p.place));
        }
        else {
            const places = await place_schema_1.default.find({
                where: options?.search?.names != null && options.search.names.length > 0
                    ? { name: (0, typeorm_1.In)(options?.search?.names ?? []) }
                    : undefined,
                select: { name: true, id: true, openAccess: true },
                skip: options?.pagination?.skip ?? 0,
                take: options?.pagination?.take ?? 25,
            });
            return this.sortPlaces(places);
        }
    }
    static async getPlaceWithParent(placeId) {
        const place = await place_schema_1.default.findOne({
            where: { id: placeId },
            relations: { parent: true }
        });
        if (!place)
            throw new graphql_exception_1.NotFoundGraphException("Place not found.");
        return place;
    }
    static async getAdminPlaces(options) {
        const take = options?.pagination?.take ?? 25;
        const index = options?.pagination?.index ?? 0;
        const skip = take * index;
        let dbPlaces = await place_schema_1.default.find({
            relations: { parent: true },
        });
        if (options?.order != null) {
            dbPlaces = this._sortAdminPlaces(dbPlaces, options.order.orderBy, options.order.ascending);
        }
        const filter = options?.filter ?? null;
        const nameFilter = filter?.name != null && filter.name !== "" ? filter.name : null;
        const parentNameFilter = filter?.parentName != null && filter.parentName !== ""
            ? filter.parentName
            : null;
        let adminPlaces;
        if (nameFilter != null || parentNameFilter != null) {
            const filteredPlaces = (0, admin_1.filterItems)(dbPlaces, this._filterFunction(nameFilter, parentNameFilter), skip, take);
            adminPlaces = {
                places: filteredPlaces.filteredItems,
                total: filteredPlaces.totalItemsFound,
            };
        }
        else if (skip <= dbPlaces.length) {
            adminPlaces = {
                places: dbPlaces.slice(skip, skip + take),
                total: dbPlaces.length,
            };
        }
        else {
            adminPlaces = {
                places: [],
                total: 0,
            };
        }
        adminPlaces.index = index;
        adminPlaces.take = take;
        return adminPlaces;
    }
    static async searchPlaces(options) {
        let places;
        if (options?.userId != null) {
            const results = await Promise.all([
                place_schema_1.PlaceAccess.find({
                    where: {
                        user: { id: options.userId },
                    },
                    select: { place: { name: true, id: true, openAccess: true } },
                }),
                place_schema_1.default.find({
                    select: { name: true, id: true, openAccess: true },
                }),
            ]);
            places = results[0].map((p) => p.place);
        }
        else {
            places = await place_schema_1.default.find({
                select: { name: true, id: true, openAccess: true },
            });
        }
        places = places.filter((x) => x.name
            .toLocaleLowerCase()
            .includes(options.searchString.toLocaleLowerCase()));
        return this.sortPlaces(places);
    }
    static async getPlace(placeId, name) {
        const places = await place_schema_1.default.find({
            where: [{ id: placeId }, { name: name }],
            take: 1,
        });
        if (places.length != 1) {
            throw new graphql_exception_1.NotFoundGraphException("Place with id '" + placeId + "' or name '" + name + "' not found");
        }
        return places[0];
    }
    static async childPlaces(parentId, pagination) {
        const places = await place_schema_1.default.find({
            where: { parent: { id: parentId } },
            select: { name: true, id: true },
            skip: pagination?.skip ?? 0,
            take: pagination?.take ?? 50,
        });
        return this.sortPlaces(places);
    }
    static async createPlace(name, userId, options) {
        const placeAccessArray = [];
        const place = new place_schema_1.default();
        place.name = name;
        place.openAccess = options?.openAccess ?? false;
        if (options && options.users && options.users.length > 0) {
            const users = await user_schema_1.default.find({
                where: {
                    id: (0, typeorm_1.In)(Array.from(new Set(options.users.map((u) => u.userId)).values())),
                },
                select: { id: true },
            });
            for (const user of options.users) {
                const foundUser = users.find((u) => u.id == user.userId);
                if (!foundUser) {
                    throw new graphql_exception_1.BadRequestGraphException("User with id " + user.userId + " does not exist.");
                }
                const access = new place_schema_1.PlaceAccess();
                access.user = foundUser;
                access.permission = user.permission;
                access.place = place;
                placeAccessArray.push(access);
            }
        }
        if (options && options.parentId) {
            if (userId != null) {
                await this.checkUserPermission(options.parentId, userId, enums_1.Permission.write);
            }
            place.parent = await this.getPlace(options.parentId);
        }
        await place.save();
        await place_schema_1.PlaceAccess.insert(placeAccessArray);
        return place;
    }
    static async updatePlace(placeId, userId, options) {
        const placeAccessArray = [];
        const place = await this.getPlace(placeId);
        if (options?.name)
            place.name = options.name;
        if (options?.parentId === place.id)
            throw new graphql_exception_1.BadRequestGraphException("Place cannot be its own parent.");
        if (options?.users && options.users.length > 0) {
            const placeAccessOld = await place_schema_1.PlaceAccess.find({
                where: { place: { id: place.id } },
                relations: { user: true },
                select: { user: { id: true } },
            });
            const users = await user_schema_1.default.find({
                where: {
                    id: (0, typeorm_1.In)(Array.from(new Set(options.users.map((u) => u.userId)).values())),
                },
                select: { id: true },
            });
            for (const user of options.users) {
                const foundUser = users.find((u) => u.id == user.userId);
                if (!foundUser) {
                    throw new graphql_exception_1.BadRequestGraphException("User with id " + user.userId + " does not exist.");
                }
                const indexOldAccess = placeAccessOld.findIndex((p) => p.user.id == foundUser.id);
                if (indexOldAccess < 0) {
                    const access = new place_schema_1.PlaceAccess();
                    access.user = foundUser;
                    access.permission = user.permission;
                    access.place = place;
                    placeAccessArray.push(access);
                }
                else {
                    if (placeAccessOld[indexOldAccess].permission != user.permission) {
                        placeAccessOld[indexOldAccess].permission = user.permission;
                        await placeAccessOld[indexOldAccess].save();
                    }
                    placeAccessOld.splice(indexOldAccess, 1);
                }
            }
            await Promise.all(placeAccessOld.map((placeAccess) => place_schema_1.PlaceAccess.delete({ id: placeAccess.id })));
        }
        if (options?.parentId == null) {
            place.parent = null;
        }
        else {
            if (userId != null)
                await this.checkUserPermission(options.parentId, userId, enums_1.Permission.write);
            place.parent = await this.getPlace(options.parentId);
        }
        await place.save();
        await place_schema_1.PlaceAccess.insert(placeAccessArray);
        return place;
    }
    static async checkUserPermission(placeId, userId, minPermission) {
        const placeAccess = await place_schema_1.PlaceAccess.findOne({
            where: { user: { id: userId }, place: { id: placeId } },
        });
        if (!placeAccess) {
            const place = await place_schema_1.default.findOne({
                where: { id: placeId, openAccess: true },
                select: { id: true },
            });
            if (!place) {
                throw new graphql_exception_1.ForbiddenGraphException("Access to place forbidden");
            }
            else {
                if (!(0, auth_middleware_1.hasPermissionAccess)(enums_1.Permission.read, minPermission)) {
                    throw new graphql_exception_1.ForbiddenGraphException("Access to place forbidden");
                }
                return;
            }
        }
        if (!(0, auth_middleware_1.hasPermissionAccess)(placeAccess.permission, minPermission)) {
            throw new graphql_exception_1.ForbiddenGraphException("Access to place forbidden");
        }
    }
    static async deletePlace(placeId) {
        const result = await place_schema_1.default.delete({ id: placeId });
        if (result.affected != 1) {
            throw new graphql_exception_1.NotFoundGraphException("Can not delete place: place not found id " + placeId);
        }
        return true;
    }
    static sortPlaces(places) {
        return places.sort((a, b) => a.name.localeCompare(b.name));
    }
    static _sortAdminPlaces(places, orderBy, ascending) {
        return places.sort((a, b) => {
            let propA = 0;
            let propB = 0;
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
            if (ascending)
                return propA < propB ? -1 : 1;
            return propA > propB ? -1 : 1;
        });
    }
    static _filterFunction(name, parentName) {
        if (name != null && parentName != null)
            return (place) => place.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()) &&
                (place.parent?.name
                    .toLocaleLowerCase()
                    .includes(parentName.toLocaleLowerCase()) ??
                    false);
        else if (name != null)
            return (place) => place.name.toLocaleLowerCase().includes(name.toLocaleLowerCase());
        else
            return (place) => place.parent?.name
                .toLocaleLowerCase()
                .includes(parentName.toLocaleLowerCase()) ?? false;
    }
}
exports.default = PlaceService;
