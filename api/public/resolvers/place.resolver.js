"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceResolver = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const user_middleware_1 = __importDefault(require("@middlewares/user.middleware"));
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const place_schema_1 = __importDefault(require("@schemas/place.schema"));
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const user_schema_1 = __importDefault(require("@schemas/user.schema"));
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const sensor_service_1 = require("@services/sensor.service");
const user_service_1 = require("@services/user.service");
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const place_validation_1 = require("@validations/place.validation");
const type_graphql_1 = require("type-graphql");
const admin_1 = require("@utils/admin");
let PlaceResolver = class PlaceResolver {
    devices(place) {
        return device_service_1.DeviceService.getDevices({ placeId: place.id });
    }
    sensors(place, user) {
        return sensor_service_1.SensorService.getSensors({
            userId: user.role == enums_1.Role.admin ? undefined : user.id,
            placeId: place.id,
        });
    }
    async parent(place) {
        const placeWithParent = await place_schema_1.default.findOne({
            where: { id: place.id },
            relations: { parent: true },
        });
        return placeWithParent?.parent ?? null;
    }
    users(place) {
        return user_service_1.UserService.getUsers({ placeId: place.id });
    }
    childPlaces(place) {
        return place_service_1.default.childPlaces(place.id);
    }
    places(user, pagination, search) {
        return place_service_1.default.getPlaces({
            pagination: pagination,
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
            search: { names: search?.names },
        });
    }
    adminPlaces(filter, pagination, order) {
        return place_service_1.default.getAdminPlaces({
            filter,
            pagination,
            order,
        });
    }
    searchPlaces(user, searchString) {
        return place_service_1.default.searchPlaces({
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
            searchString,
        });
    }
    async place({ id, name }, user) {
        const place = await place_service_1.default.getPlace(id, name);
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await place_service_1.default.checkUserPermission(place.id, user.id, enums_1.Permission.read);
        }
        return place;
    }
    createPlace({ name }, user, options) {
        return place_service_1.default.createPlace(name, user.role != enums_1.Role.admin ? user.id : undefined, options);
    }
    updatePlace({ id }, user, options) {
        return place_service_1.default.updatePlace(id, user.role != enums_1.Role.admin ? user.id : undefined, options);
    }
    async deletePlace({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await place_service_1.default.checkUserPermission(id, user.id, enums_1.Permission.admin);
        }
        else {
            await place_service_1.default.getPlace(id);
        }
        if ((await device_schema_1.default.findOneBy({ place: { id: id } })) != null) {
            throw new graphql_exception_1.BadRequestGraphException("There are devices registered in the place, remove them first");
        }
        if ((await place_schema_1.default.findOneBy({ parent: { id: id } })) != null) {
            throw new graphql_exception_1.BadRequestGraphException("The place contains child places, remove them first");
        }
        return place_service_1.default.deletePlace(id);
    }
};
exports.PlaceResolver = PlaceResolver;
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.FieldResolver)(() => [device_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_schema_1.default]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "devices", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.FieldResolver)(() => [sensor_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_schema_1.default, Object]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "sensors", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.FieldResolver)(() => place_schema_1.default, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_schema_1.default]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "parent", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.FieldResolver)(() => [user_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_schema_1.default]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.FieldResolver)(() => [place_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_schema_1.default]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "childPlaces", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [place_schema_1.default]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("search", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, place_validation_1.PlaceGetPaginationInput,
        place_validation_1.PlacesGetSearchArgs]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "places", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => admin_1.AdminPlaces),
    __param(0, (0, type_graphql_1.Arg)("filter", { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("order", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_validation_1.PlacesGetFilterArgs,
        place_validation_1.PlacesGetPaginationArgs,
        place_validation_1.PlacesGetOrderArgs]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "adminPlaces", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [place_schema_1.default]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Arg)("searchString", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "searchPlaces", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => place_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_validation_1.PlaceGetArgs, Object]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "place", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => place_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_validation_1.PlaceCreateArgs, Object, place_validation_1.PlaceCreateInput]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "createPlace", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => place_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_validation_1.PlaceUpdateArgs, Object, place_validation_1.PlaceUpdateInput]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "updatePlace", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_validation_1.PlaceDeleteArgs, Object]),
    __metadata("design:returntype", Promise)
], PlaceResolver.prototype, "deletePlace", null);
exports.PlaceResolver = PlaceResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => place_schema_1.default)
], PlaceResolver);
