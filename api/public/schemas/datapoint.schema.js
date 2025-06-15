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
exports.Datapoint = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let Datapoint = class Datapoint extends typeorm_1.BaseEntity {
    timestamp;
    value;
    valueString;
    sensorId;
    constructor(options) {
        super();
        if (options) {
            this.timestamp = options.timestamp;
            this.sensorId = options.sensorId;
            this.value = options.value;
            this.valueString = options.valueString;
        }
    }
};
exports.Datapoint = Datapoint;
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)({
        nullable: false,
        type: "timestamptz",
        primary: true,
        width: 3,
        name: "timestamp",
    }),
    __metadata("design:type", Date)
], Datapoint.prototype, "timestamp", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true, type: "float", name: "value" }),
    __metadata("design:type", Number)
], Datapoint.prototype, "value", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true, type: "simple-json", name: "value_string" }),
    __metadata("design:type", String)
], Datapoint.prototype, "valueString", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: false }),
    (0, typeorm_1.Column)({ nullable: false, type: "int", primary: true, name: "sensor_id" }),
    __metadata("design:type", Number)
], Datapoint.prototype, "sensorId", void 0);
exports.Datapoint = Datapoint = __decorate([
    (0, typeorm_1.Entity)({ name: "datapoints" }),
    (0, typeorm_1.Index)(["sensorId", "timestamp"], { unique: true }),
    (0, type_graphql_1.ObjectType)("Datapoint"),
    __metadata("design:paramtypes", [Object])
], Datapoint);
