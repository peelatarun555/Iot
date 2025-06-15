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
exports.DatapointResolver = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const user_middleware_1 = __importDefault(require("@middlewares/user.middleware"));
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const enums_1 = require("@utils/enums");
const datapoint_service_1 = require("@services/datapoint.service");
const sensor_service_1 = require("@services/sensor.service");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const datapoint_validation_1 = require("@validations/datapoint.validation");
const type_graphql_1 = require("type-graphql");
const library_service_1 = __importDefault(require("@services/library.service"));
let DatapointResolver = class DatapointResolver {
    async datapoints(user, { sensorId }, options, pagination) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.read);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        return datapoint_service_1.DatapointService.getDatapoints({
            pagination: pagination,
            sensorId: sensorId,
            options: options,
        });
    }
    async datapoint({ sensorId, timestamp }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.read);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        return datapoint_service_1.DatapointService.getDatapoint(sensorId, timestamp);
    }
    async createDatapoint({ timestamp, value, sensorId, valueString }, user) {
        if (value == null && valueString == null) {
            throw new graphql_exception_1.ValidationGraphException("One of [value, valueString] must not be null");
        }
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.write);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        if (value == null && Number.isFinite(Number(valueString)))
            value = Number(valueString);
        const datapoint = await datapoint_service_1.DatapointService.createDatapoint(timestamp, sensorId, value, valueString);
        await library_service_1.default.onDatapointChange(sensorId);
        return datapoint;
    }
    async updateDatapoint({ timestamp, value, sensorId, valueString }, user) {
        if (value == null && valueString == null) {
            throw new graphql_exception_1.ValidationGraphException("One of [value, valueString] must not be null");
        }
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.write);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        if (value == null && Number.isFinite(Number(valueString)))
            value = Number(valueString);
        const datapoint = await datapoint_service_1.DatapointService.updateDatapoint(timestamp, sensorId, value, valueString);
        await library_service_1.default.onDatapointChange(sensorId);
        return datapoint;
    }
    async deleteDatapoint({ timestamp, sensorId }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.write);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        const deleted = await datapoint_service_1.DatapointService.deleteDatapoint(timestamp, sensorId);
        if (deleted)
            await library_service_1.default.onDatapointChange(sensorId);
        return deleted;
    }
    async deleteAllDatapointsOfSensor({ sensorId }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.write);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        const deleted = await datapoint_service_1.DatapointService.deleteDatapointsSensor(sensorId);
        if (deleted)
            await library_service_1.default.onDatapointChange(sensorId);
        return deleted;
    }
    async deleteDatapointsTime({ timestampFrom, timestampTo, sensorId }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await sensor_service_1.SensorService.checkUserPermission(sensorId, user.id, enums_1.Permission.write);
        }
        else {
            await sensor_service_1.SensorService.getSensor(sensorId);
        }
        const deleted = await datapoint_service_1.DatapointService.deleteDatapointsTime(timestampFrom, timestampTo, sensorId);
        if (deleted > 0)
            await library_service_1.default.onDatapointChange(sensorId);
        return deleted;
    }
};
exports.DatapointResolver = DatapointResolver;
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [datapoint_schema_1.Datapoint]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Args)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, datapoint_validation_1.DatapointsGetArgs,
        datapoint_validation_1.DatapointsGetOptionInput,
        datapoint_validation_1.DatapointGetPaginationInput]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "datapoints", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => datapoint_schema_1.Datapoint),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datapoint_validation_1.DatapointGetArgs, Object]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "datapoint", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => datapoint_schema_1.Datapoint),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datapoint_validation_1.DatapointCreateArgs, Object]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "createDatapoint", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => datapoint_schema_1.Datapoint),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datapoint_validation_1.DatapointUpdateArgs, Object]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "updateDatapoint", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datapoint_validation_1.DatapointDeleteArgs, Object]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "deleteDatapoint", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datapoint_validation_1.DatapointDeleteSensorArgs, Object]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "deleteAllDatapointsOfSensor", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => Number),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datapoint_validation_1.DatapointDeleteTimeArgs, Object]),
    __metadata("design:returntype", Promise)
], DatapointResolver.prototype, "deleteDatapointsTime", null);
exports.DatapointResolver = DatapointResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => datapoint_schema_1.Datapoint)
], DatapointResolver);
