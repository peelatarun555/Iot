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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceType = void 0;
const enums_1 = require("@utils/enums");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const location_schema_1 = __importDefault(require("./location.schema"));
const place_schema_1 = __importDefault(require("./place.schema"));
const sensor_schema_1 = __importDefault(require("./sensor.schema"));
let DeviceType = class DeviceType extends typeorm_1.BaseEntity {
    id;
    name;
};
exports.DeviceType = DeviceType;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: false }),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    __metadata("design:type", Number)
], DeviceType.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, unique: true, name: "name" }),
    __metadata("design:type", String)
], DeviceType.prototype, "name", void 0);
exports.DeviceType = DeviceType = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)({ name: "device_types" })
], DeviceType);
let Device = class Device extends typeorm_1.BaseEntity {
    id;
    name;
    deviceType;
    devEui;
    description;
    status;
    createdAt;
    deletedAt;
    place;
    location;
    sensors;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", Number)
], Device.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, name: "name" }),
    __metadata("design:type", String)
], Device.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.ManyToOne)(() => DeviceType, (deviceType) => deviceType.id, {
        cascade: true,
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: "device_type_id" }),
    __metadata("design:type", Object)
], Device.prototype, "deviceType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 32, unique: true, name: "dev_eui" }),
    __metadata("design:type", String)
], Device.prototype, "devEui", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ length: 256, nullable: true, name: "description" }),
    __metadata("design:type", String)
], Device.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.DeviceStatus),
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.DeviceStatus, name: "status" }),
    __metadata("design:type", String)
], Device.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)({
        type: "timestamp",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], Device.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "deleted_at" }),
    __metadata("design:type", Object)
], Device.prototype, "deletedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => place_schema_1.default),
    (0, typeorm_1.ManyToOne)(() => place_schema_1.default, (place) => place.id, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "place_id" }),
    __metadata("design:type", place_schema_1.default)
], Device.prototype, "place", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => location_schema_1.default, { nullable: true }),
    (0, typeorm_1.OneToOne)(() => location_schema_1.default, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "location_id" }),
    __metadata("design:type", location_schema_1.default)
], Device.prototype, "location", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [sensor_schema_1.default]),
    (0, typeorm_1.OneToMany)(() => sensor_schema_1.default, (sensor) => sensor.device, {
        cascade: true,
        nullable: false,
    }),
    __metadata("design:type", Array)
], Device.prototype, "sensors", void 0);
Device = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)({ name: "devices" })
], Device);
exports.default = Device;
