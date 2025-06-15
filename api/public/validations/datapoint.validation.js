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
exports.DatapointDeleteTimeArgs = exports.DatapointDeleteSensorArgs = exports.DatapointDeleteArgs = exports.DatapointUpdateArgs = exports.DatapointCreateArgs = exports.DatapointsGetArgs = exports.DatapointsGetOptionInput = exports.DatapointGetPaginationInput = exports.DatapointGetArgs = void 0;
const enums_1 = require("@utils/enums");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let DatapointGetArgs = class DatapointGetArgs {
    sensorId;
    timestamp;
};
exports.DatapointGetArgs = DatapointGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DatapointGetArgs.prototype, "sensorId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DatapointGetArgs.prototype, "timestamp", void 0);
exports.DatapointGetArgs = DatapointGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointGetArgs);
let DatapointGetPaginationInput = class DatapointGetPaginationInput {
    take = 500;
    skip = 0;
};
exports.DatapointGetPaginationInput = DatapointGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 500 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Object)
], DatapointGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], DatapointGetPaginationInput.prototype, "skip", void 0);
exports.DatapointGetPaginationInput = DatapointGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], DatapointGetPaginationInput);
let DatapointsGetOptionInput = class DatapointsGetOptionInput {
    from;
    to;
    timeGroupSettings;
    binSize;
};
exports.DatapointsGetOptionInput = DatapointsGetOptionInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointsGetOptionInput.prototype, "from", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointsGetOptionInput.prototype, "to", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.TimeGroupSettings, {
        nullable: true,
        defaultValue: enums_1.TimeGroupSettings.minute,
    }),
    (0, class_validator_1.IsEnum)(enums_1.TimeGroupSettings),
    __metadata("design:type", String)
], DatapointsGetOptionInput.prototype, "timeGroupSettings", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true, defaultValue: 15 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], DatapointsGetOptionInput.prototype, "binSize", void 0);
exports.DatapointsGetOptionInput = DatapointsGetOptionInput = __decorate([
    (0, type_graphql_1.InputType)()
], DatapointsGetOptionInput);
let DatapointsGetArgs = class DatapointsGetArgs {
    sensorId;
};
exports.DatapointsGetArgs = DatapointsGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointsGetArgs.prototype, "sensorId", void 0);
exports.DatapointsGetArgs = DatapointsGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointsGetArgs);
let DatapointCreateArgs = class DatapointCreateArgs {
    timestamp;
    value;
    valueString;
    sensorId;
};
exports.DatapointCreateArgs = DatapointCreateArgs;
__decorate([
    (0, type_graphql_1.Field)({ nullable: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointCreateArgs.prototype, "timestamp", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDecimal)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointCreateArgs.prototype, "value", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatapointCreateArgs.prototype, "valueString", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointCreateArgs.prototype, "sensorId", void 0);
exports.DatapointCreateArgs = DatapointCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointCreateArgs);
let DatapointUpdateArgs = class DatapointUpdateArgs {
    timestamp;
    value;
    valueString;
    sensorId;
};
exports.DatapointUpdateArgs = DatapointUpdateArgs;
__decorate([
    (0, type_graphql_1.Field)({ nullable: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointUpdateArgs.prototype, "timestamp", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDecimal)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointUpdateArgs.prototype, "value", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatapointUpdateArgs.prototype, "valueString", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointUpdateArgs.prototype, "sensorId", void 0);
exports.DatapointUpdateArgs = DatapointUpdateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointUpdateArgs);
let DatapointDeleteArgs = class DatapointDeleteArgs {
    timestamp;
    sensorId;
};
exports.DatapointDeleteArgs = DatapointDeleteArgs;
__decorate([
    (0, type_graphql_1.Field)({ nullable: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointDeleteArgs.prototype, "timestamp", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointDeleteArgs.prototype, "sensorId", void 0);
exports.DatapointDeleteArgs = DatapointDeleteArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointDeleteArgs);
let DatapointDeleteSensorArgs = class DatapointDeleteSensorArgs {
    sensorId;
};
exports.DatapointDeleteSensorArgs = DatapointDeleteSensorArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointDeleteSensorArgs.prototype, "sensorId", void 0);
exports.DatapointDeleteSensorArgs = DatapointDeleteSensorArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointDeleteSensorArgs);
let DatapointDeleteTimeArgs = class DatapointDeleteTimeArgs {
    timestampFrom;
    timestampTo;
    sensorId;
};
exports.DatapointDeleteTimeArgs = DatapointDeleteTimeArgs;
__decorate([
    (0, type_graphql_1.Field)({ nullable: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointDeleteTimeArgs.prototype, "timestampFrom", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(() => new Date("2011-01-01T00:00:00.0000Z")),
    (0, class_validator_1.MaxDate)(() => new Date("3000-01-01T00:00:00.0000Z")),
    __metadata("design:type", Date)
], DatapointDeleteTimeArgs.prototype, "timestampTo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DatapointDeleteTimeArgs.prototype, "sensorId", void 0);
exports.DatapointDeleteTimeArgs = DatapointDeleteTimeArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatapointDeleteTimeArgs);
