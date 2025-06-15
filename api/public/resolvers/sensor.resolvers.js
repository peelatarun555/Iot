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
exports.SensorResolver = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const user_middleware_1 = __importDefault(require("@middlewares/user.middleware"));
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const sensor_schema_1 = __importStar(require("@schemas/sensor.schema"));
const datapoint_service_1 = require("@services/datapoint.service");
const device_service_1 = require("@services/device.service");
const sensor_service_1 = require("@services/sensor.service");
const enums_1 = require("@utils/enums");
const datapoint_validation_1 = require("@validations/datapoint.validation");
const sensor_validation_1 = require("@validations/sensor.validation");
const type_graphql_1 = require("type-graphql");
const admin_1 = require("@utils/admin");
let SensorResolver = class SensorResolver {
    data(sensor, options, pagination) {
        return datapoint_service_1.DatapointService.getDatapoints({
            sensorId: sensor.id,
            pagination,
            options,
        });
    }
    async device(sensor) {
        return sensor_service_1.SensorService.getDeviceFromSensor(sensor.id);
    }
    sensors(user, pagination) {
        return sensor_service_1.SensorService.getSensors({
            pagination: pagination,
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
        });
    }
    adminSensors(filter, pagination, order) {
        return sensor_service_1.SensorService.getAdminSensors({
            filter,
            pagination,
            order,
        });
    }
    searchSensors(searchString) {
        return sensor_service_1.SensorService.searchSensors(searchString);
    }
    sensorTypes() {
        return sensor_service_1.SensorService.getSensorTypes();
    }
    async sensor({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(id, user.id, enums_1.Permission.read);
        }
        return sensor_service_1.SensorService.getSensor(id);
    }
    async createSensor({ name, sensorType, deviceId }, user, options) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await device_service_1.DeviceService.checkUserPermission(deviceId, user.id, enums_1.Permission.write);
        }
        return sensor_service_1.SensorService.createSensor(name, sensorType, deviceId, options);
    }
    async updateSensor({ id }, user, options) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(id, user.id, enums_1.Permission.write);
        }
        return sensor_service_1.SensorService.updateSensor(id, options);
    }
    async deleteSensor({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(id, user.id, enums_1.Permission.write);
        }
        else {
            await sensor_service_1.SensorService.getSensor(id);
        }
        return sensor_service_1.SensorService.deleteSensor(id);
    }
};
exports.SensorResolver = SensorResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [datapoint_schema_1.Datapoint]),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_schema_1.default,
        datapoint_validation_1.DatapointsGetOptionInput,
        datapoint_validation_1.DatapointGetPaginationInput]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "data", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => device_schema_1.default),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_schema_1.default]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "device", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [sensor_schema_1.default]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sensor_validation_1.SensorGetPaginationInput]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "sensors", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => admin_1.AdminSensors),
    __param(0, (0, type_graphql_1.Arg)("filter", { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("order", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_validation_1.SensorsGetFilterArgs,
        sensor_validation_1.SensorsGetPaginationArgs,
        sensor_validation_1.SensorsGetOrderArgs]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "adminSensors", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => [sensor_schema_1.default]),
    __param(0, (0, type_graphql_1.Arg)("searchString", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "searchSensors", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [sensor_schema_1.SensorType]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "sensorTypes", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => sensor_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_validation_1.SensorGetArgs, Object]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "sensor", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => sensor_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_validation_1.SensorCreateArgs, Object, sensor_validation_1.SensorCreateInput]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "createSensor", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => sensor_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_validation_1.SensorUpdateArgs, Object, sensor_validation_1.SensorUpdateInput]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "updateSensor", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_validation_1.SensorDeleteArgs, Object]),
    __metadata("design:returntype", Promise)
], SensorResolver.prototype, "deleteSensor", null);
exports.SensorResolver = SensorResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => sensor_schema_1.default)
], SensorResolver);
