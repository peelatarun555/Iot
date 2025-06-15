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
exports.SensorType = void 0;
const enums_1 = require("@utils/enums");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const device_schema_1 = __importDefault(require("./device.schema"));
const project_schema_1 = __importDefault(require("./project.schema"));
let SensorType = class SensorType extends typeorm_1.BaseEntity {
    id;
    name;
    type;
};
exports.SensorType = SensorType;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    __metadata("design:type", Number)
], SensorType.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, unique: true, name: "name" }),
    __metadata("design:type", String)
], SensorType.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.SensorDataType),
    (0, typeorm_1.Column)({
        enum: enums_1.SensorDataType,
        type: "enum",
        default: enums_1.SensorDataType.number,
        name: "type",
    }),
    __metadata("design:type", String)
], SensorType.prototype, "type", void 0);
exports.SensorType = SensorType = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)({ name: "sensor_types" })
], SensorType);
let Sensor = class Sensor extends typeorm_1.BaseEntity {
    id;
    name;
    libraryId;
    alias;
    deletedAt;
    sensorType;
    device;
    projects;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", Number)
], Sensor.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, name: "name" }),
    __metadata("design:type", String)
], Sensor.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ length: 32, nullable: true, name: "library_id" }),
    (0, typeorm_1.Index)({ unique: true, where: "library_id IS NOT NULL" }),
    __metadata("design:type", String)
], Sensor.prototype, "libraryId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ length: 32, nullable: true, name: "alias" }),
    __metadata("design:type", String)
], Sensor.prototype, "alias", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "deleted_at" }),
    __metadata("design:type", Object)
], Sensor.prototype, "deletedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.ManyToOne)(() => SensorType, (sensorType) => sensorType.id, {
        nullable: false,
        cascade: ["insert", "update"],
    }),
    (0, typeorm_1.JoinColumn)({ name: "sensor_type_id" }),
    __metadata("design:type", Object)
], Sensor.prototype, "sensorType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => device_schema_1.default, (device) => device.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "device_id" }),
    __metadata("design:type", device_schema_1.default)
], Sensor.prototype, "device", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => project_schema_1.default),
    (0, typeorm_1.ManyToMany)(() => project_schema_1.default, { cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: "project_sensors",
        joinColumn: { name: "project_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "sensor_id", referencedColumnName: "id" },
    }),
    __metadata("design:type", Array)
], Sensor.prototype, "projects", void 0);
Sensor = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)({ name: "sensors" })
], Sensor);
exports.default = Sensor;
