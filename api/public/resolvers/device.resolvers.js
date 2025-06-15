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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.DeviceResolver = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const user_middleware_1 = __importDefault(require("@middlewares/user.middleware"));
const device_schema_1 = __importStar(require("@schemas/device.schema"));
const place_schema_1 = __importDefault(require("@schemas/place.schema"));
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const sensor_service_1 = require("@services/sensor.service");
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const device_validation_1 = require("@validations/device.validation");
const type_graphql_1 = require("type-graphql");
const admin_1 = require("@utils/admin");
let DeviceResolver = class DeviceResolver {
    place(device) {
        return device_service_1.DeviceService.getPlaceFromDevice(device.id);
    }
    sensors(device) {
        return sensor_service_1.SensorService.getSensors({ deviceId: device.id });
    }
    deviceTypes() {
        return device_service_1.DeviceService.getDeviceTypes();
    }
    devices(user, pagination, options) {
        if (options?.deleted && user.role != enums_1.Role.admin) {
            throw new graphql_exception_1.ForbiddenGraphException("You are not allowed to get deleted devices");
        }
        return device_service_1.DeviceService.getDevices({
            pagination: pagination,
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
            deleted: options?.deleted,
        });
    }
    adminDevices(filter, pagination, order) {
        return device_service_1.DeviceService.getAdminDevices({
            filter,
            pagination,
            order,
        });
    }
    searchDevices(user, searchString) {
        return device_service_1.DeviceService.searchDevices({
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
            searchString,
        });
    }
    async device({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await device_service_1.DeviceService.checkUserPermission(id, user.id, enums_1.Permission.read);
        }
        return device_service_1.DeviceService.getDevice(id);
    }
    async createDevice({ name, deviceType, devEui, status, placeId }, user, options) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await place_service_1.default.checkUserPermission(placeId, user.id, enums_1.Permission.write);
        }
        return device_service_1.DeviceService.createDevice(name, devEui, deviceType, status, placeId, options);
    }
    async updateDevice({ id }, user, options) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await device_service_1.DeviceService.checkUserPermission(id, user.id, enums_1.Permission.write);
        }
        return device_service_1.DeviceService.updateDevice(id, user.role == enums_1.Role.admin ? undefined : user.id, options);
    }
    async deleteDevice({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await device_service_1.DeviceService.checkUserPermission(id, user.id, enums_1.Permission.write);
        }
        else {
            await device_service_1.DeviceService.getDevice(id);
        }
        return device_service_1.DeviceService.softDeleteDevice(id);
    }
    async deleteDeviceHard({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            throw new graphql_exception_1.ForbiddenGraphException("Only superadmins are allowed to hard delete a device.");
        }
        else {
            await device_service_1.DeviceService.getDevice(id, true);
        }
        return device_service_1.DeviceService.hardDeleteDevice(id);
    }
    async undoDeleteDevice({ id }) {
        return device_service_1.DeviceService.undoSoftDeleteDevice(id);
    }
};
exports.DeviceResolver = DeviceResolver;
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.FieldResolver)(() => place_schema_1.default),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_schema_1.default]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "place", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [sensor_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_schema_1.default]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "sensors", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => [device_schema_1.DeviceType]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "deviceTypes", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [device_schema_1.default]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, device_validation_1.DeviceGetPaginationInput,
        device_validation_1.DeviceGetOptionsInput]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "devices", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => admin_1.AdminDevices),
    __param(0, (0, type_graphql_1.Arg)("filter", { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("order", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DevicesGetFilterArgs,
        device_validation_1.DevicesGetPaginationArgs,
        device_validation_1.DevicesGetOrderArgs]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "adminDevices", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [place_schema_1.default]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Arg)("searchString", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "searchDevices", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => device_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DeviceGetArgs, Object]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "device", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => device_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DeviceCreateArgs, Object, device_validation_1.DeviceCreateInput]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "createDevice", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => device_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DeviceGetArgs, Object, device_validation_1.DeviceUpdateInput]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "updateDevice", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DeviceGetArgs, Object]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "deleteDevice", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DeviceGetArgs, Object]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "deleteDeviceHard", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Mutation)(() => device_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_validation_1.DeviceGetArgs]),
    __metadata("design:returntype", Promise)
], DeviceResolver.prototype, "undoDeleteDevice", null);
exports.DeviceResolver = DeviceResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => device_schema_1.default)
], DeviceResolver);
