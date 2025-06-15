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
exports.SensorsGetOrderArgs = exports.SensorsGetPaginationArgs = exports.SensorsGetFilterArgs = exports.SensorDeleteArgs = exports.SensorUpdateInput = exports.SensorUpdateArgs = exports.SensorCreateInput = exports.SensorCreateArgs = exports.SensorGetArgs = exports.SensorGetPaginationInput = void 0;
const enums_1 = require("@utils/enums");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let SensorGetPaginationInput = class SensorGetPaginationInput {
    take = 25;
    skip = 0;
};
exports.SensorGetPaginationInput = SensorGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Object)
], SensorGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], SensorGetPaginationInput.prototype, "skip", void 0);
exports.SensorGetPaginationInput = SensorGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], SensorGetPaginationInput);
let SensorGetArgs = class SensorGetArgs {
    id;
};
exports.SensorGetArgs = SensorGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SensorGetArgs.prototype, "id", void 0);
exports.SensorGetArgs = SensorGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], SensorGetArgs);
let SensorCreateArgs = class SensorCreateArgs {
    name;
    sensorType;
    deviceId;
};
exports.SensorCreateArgs = SensorCreateArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorCreateArgs.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorCreateArgs.prototype, "sensorType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SensorCreateArgs.prototype, "deviceId", void 0);
exports.SensorCreateArgs = SensorCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], SensorCreateArgs);
let SensorCreateInput = class SensorCreateInput {
    alias;
    libraryId;
    sensorDataType;
};
exports.SensorCreateInput = SensorCreateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(0, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorCreateInput.prototype, "alias", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(0, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorCreateInput.prototype, "libraryId", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(enums_1.SensorDataType),
    __metadata("design:type", String)
], SensorCreateInput.prototype, "sensorDataType", void 0);
exports.SensorCreateInput = SensorCreateInput = __decorate([
    (0, type_graphql_1.InputType)()
], SensorCreateInput);
let SensorUpdateArgs = class SensorUpdateArgs {
    id;
};
exports.SensorUpdateArgs = SensorUpdateArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SensorUpdateArgs.prototype, "id", void 0);
exports.SensorUpdateArgs = SensorUpdateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], SensorUpdateArgs);
let SensorUpdateInput = class SensorUpdateInput {
    alias;
    libraryId;
    name;
    sensorType;
    deviceId;
};
exports.SensorUpdateInput = SensorUpdateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(0, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorUpdateInput.prototype, "alias", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(0, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorUpdateInput.prototype, "libraryId", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorUpdateInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], SensorUpdateInput.prototype, "sensorType", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SensorUpdateInput.prototype, "deviceId", void 0);
exports.SensorUpdateInput = SensorUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], SensorUpdateInput);
let SensorDeleteArgs = class SensorDeleteArgs {
    id;
};
exports.SensorDeleteArgs = SensorDeleteArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SensorDeleteArgs.prototype, "id", void 0);
exports.SensorDeleteArgs = SensorDeleteArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], SensorDeleteArgs);
let SensorsGetFilterArgs = class SensorsGetFilterArgs {
    name;
    alias;
    type;
    libraryId;
    deviceName;
};
exports.SensorsGetFilterArgs = SensorsGetFilterArgs;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SensorsGetFilterArgs.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SensorsGetFilterArgs.prototype, "alias", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SensorsGetFilterArgs.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SensorsGetFilterArgs.prototype, "libraryId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SensorsGetFilterArgs.prototype, "deviceName", void 0);
exports.SensorsGetFilterArgs = SensorsGetFilterArgs = __decorate([
    (0, type_graphql_1.InputType)()
], SensorsGetFilterArgs);
let SensorsGetPaginationArgs = class SensorsGetPaginationArgs {
    index = 0;
    take = 25;
};
exports.SensorsGetPaginationArgs = SensorsGetPaginationArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], SensorsGetPaginationArgs.prototype, "index", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], SensorsGetPaginationArgs.prototype, "take", void 0);
exports.SensorsGetPaginationArgs = SensorsGetPaginationArgs = __decorate([
    (0, type_graphql_1.InputType)()
], SensorsGetPaginationArgs);
let SensorsGetOrderArgs = class SensorsGetOrderArgs {
    orderBy;
    ascending;
};
exports.SensorsGetOrderArgs = SensorsGetOrderArgs;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SensorsGetOrderArgs.prototype, "orderBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SensorsGetOrderArgs.prototype, "ascending", void 0);
exports.SensorsGetOrderArgs = SensorsGetOrderArgs = __decorate([
    (0, type_graphql_1.InputType)()
], SensorsGetOrderArgs);
