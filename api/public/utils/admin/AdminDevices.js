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
const type_graphql_1 = require("type-graphql");
const IAdminItems_1 = __importDefault(require("@utils/admin/IAdminItems"));
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
let AdminDevices = class AdminDevices extends IAdminItems_1.default {
    devices;
};
__decorate([
    (0, type_graphql_1.Field)(() => [device_schema_1.default]),
    __metadata("design:type", Array)
], AdminDevices.prototype, "devices", void 0);
AdminDevices = __decorate([
    (0, type_graphql_1.ObjectType)({ implements: IAdminItems_1.default })
], AdminDevices);
exports.default = AdminDevices;
