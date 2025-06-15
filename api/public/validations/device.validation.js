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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesGetOrderArgs = exports.DevicesGetPaginationArgs = exports.DevicesGetFilterArgs = exports.DeviceUpdateInput = exports.DeviceCreateInput = exports.DeviceCreateArgs = exports.DeviceSensorInput = exports.DeviceGetArgs = exports.DeviceGetOptionsInput = exports.DeviceGetPaginationInput = void 0;
const enums_1 = require("@utils/enums");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let DeviceGetPaginationInput = class DeviceGetPaginationInput {
    take = 25;
    skip = 0;
};
exports.DeviceGetPaginationInput = DeviceGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Object)
], DeviceGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], DeviceGetPaginationInput.prototype, "skip", void 0);
exports.DeviceGetPaginationInput = DeviceGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], DeviceGetPaginationInput);
let DeviceGetOptionsInput = class DeviceGetOptionsInput {
    deleted = false;
};
exports.DeviceGetOptionsInput = DeviceGetOptionsInput;
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], DeviceGetOptionsInput.prototype, "deleted", void 0);
exports.DeviceGetOptionsInput = DeviceGetOptionsInput = __decorate([
    (0, type_graphql_1.InputType)()
], DeviceGetOptionsInput);
let DeviceGetArgs = class DeviceGetArgs {
    id;
};
exports.DeviceGetArgs = DeviceGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DeviceGetArgs.prototype, "id", void 0);
exports.DeviceGetArgs = DeviceGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DeviceGetArgs);
let DeviceSensorInput = class DeviceSensorInput {
    name;
    alias;
    sensorType;
};
exports.DeviceSensorInput = DeviceSensorInput;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.Matches)(RegExp("^[A-Za-z0-9](?:[-]?[a-z0-9]){2,}$")),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceSensorInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceSensorInput.prototype, "alias", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceSensorInput.prototype, "sensorType", void 0);
exports.DeviceSensorInput = DeviceSensorInput = __decorate([
    (0, type_graphql_1.InputType)()
], DeviceSensorInput);
let DeviceCreateArgs = class DeviceCreateArgs {
    name;
    deviceType;
    devEui;
    status;
    placeId;
};
exports.DeviceCreateArgs = DeviceCreateArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 64),
    (0, class_validator_1.IsAlphanumeric)(),
    (0, class_validator_1.Matches)(RegExp("^[A-Za-z0-9](?:[-]?[a-z0-9]){2,}$")),
    __metadata("design:type", String)
], DeviceCreateArgs.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceCreateArgs.prototype, "deviceType", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(16, 16),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceCreateArgs.prototype, "devEui", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.DeviceStatus),
    (0, class_validator_1.IsEnum)(enums_1.DeviceStatus),
    __metadata("design:type", String)
], DeviceCreateArgs.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DeviceCreateArgs.prototype, "placeId", void 0);
exports.DeviceCreateArgs = DeviceCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DeviceCreateArgs);
let DeviceCreateInput = class DeviceCreateInput {
    description;
    createdAt;
    sensors;
};
exports.DeviceCreateInput = DeviceCreateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(0, 256),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceCreateInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DeviceCreateInput.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [DeviceSensorInput], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(16),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], DeviceCreateInput.prototype, "sensors", void 0);
exports.DeviceCreateInput = DeviceCreateInput = __decorate([
    (0, type_graphql_1.InputType)()
], DeviceCreateInput);
let DeviceUpdateInput = class DeviceUpdateInput {
    description;
    createdAt;
    name;
    deviceType;
    devEui;
    status;
    placeId;
};
exports.DeviceUpdateInput = DeviceUpdateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(0, 256),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceUpdateInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DeviceUpdateInput.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 64),
    (0, class_validator_1.IsAlphanumeric)(),
    (0, class_validator_1.Matches)(RegExp("^[A-Za-z0-9](?:[-]?[a-z0-9]){2,}$")),
    __metadata("design:type", String)
], DeviceUpdateInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceUpdateInput.prototype, "deviceType", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(16, 16),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DeviceUpdateInput.prototype, "devEui", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.DeviceStatus, { nullable: true }),
    (0, class_validator_1.IsEnum)(enums_1.DeviceStatus),
    __metadata("design:type", String)
], DeviceUpdateInput.prototype, "status", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DeviceUpdateInput.prototype, "placeId", void 0);
exports.DeviceUpdateInput = DeviceUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], DeviceUpdateInput);
let DevicesGetFilterArgs = class DevicesGetFilterArgs {
    name;
    eui;
    description;
    type;
    placeName;
};
exports.DevicesGetFilterArgs = DevicesGetFilterArgs;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DevicesGetFilterArgs.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DevicesGetFilterArgs.prototype, "eui", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DevicesGetFilterArgs.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DevicesGetFilterArgs.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DevicesGetFilterArgs.prototype, "placeName", void 0);
exports.DevicesGetFilterArgs = DevicesGetFilterArgs = __decorate([
    (0, type_graphql_1.InputType)()
], DevicesGetFilterArgs);
let DevicesGetPaginationArgs = class DevicesGetPaginationArgs {
    index = 0;
    take = 25;
};
exports.DevicesGetPaginationArgs = DevicesGetPaginationArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], DevicesGetPaginationArgs.prototype, "index", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], DevicesGetPaginationArgs.prototype, "take", void 0);
exports.DevicesGetPaginationArgs = DevicesGetPaginationArgs = __decorate([
    (0, type_graphql_1.InputType)()
], DevicesGetPaginationArgs);
let DevicesGetOrderArgs = class DevicesGetOrderArgs {
    orderBy;
    ascending;
};
exports.DevicesGetOrderArgs = DevicesGetOrderArgs;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DevicesGetOrderArgs.prototype, "orderBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DevicesGetOrderArgs.prototype, "ascending", void 0);
exports.DevicesGetOrderArgs = DevicesGetOrderArgs = __decorate([
    (0, type_graphql_1.InputType)()
], DevicesGetOrderArgs);
