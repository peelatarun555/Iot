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
exports.PlaceAccess = void 0;
const enums_1 = require("@utils/enums");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const device_schema_1 = __importDefault(require("./device.schema"));
const user_schema_1 = __importDefault(require("./user.schema"));
let Place = class Place extends typeorm_1.BaseEntity {
    id;
    name;
    openAccess;
    parent;
    placeAccess;
    devices;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", Number)
], Place.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 64, unique: true, name: "name" }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", String)
], Place.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false, name: "open_access" }),
    __metadata("design:type", Boolean)
], Place.prototype, "openAccess", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Place, (place) => place.id, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: "parent_id" }),
    __metadata("design:type", Object)
], Place.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PlaceAccess, (placeAccess) => placeAccess.place),
    __metadata("design:type", Array)
], Place.prototype, "placeAccess", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => device_schema_1.default, (device) => device.place),
    __metadata("design:type", Array)
], Place.prototype, "devices", void 0);
Place = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)({ name: "places" })
], Place);
exports.default = Place;
let PlaceAccess = class PlaceAccess extends typeorm_1.BaseEntity {
    id;
    user;
    place;
    permission;
};
exports.PlaceAccess = PlaceAccess;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    __metadata("design:type", Number)
], PlaceAccess.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => user_schema_1.default),
    (0, typeorm_1.ManyToOne)(() => user_schema_1.default, (user) => user.id, {
        cascade: true,
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", user_schema_1.default)
], PlaceAccess.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Place),
    (0, typeorm_1.ManyToOne)(() => Place, (place) => place.id, {
        cascade: true,
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "place_id" }),
    __metadata("design:type", Place)
], PlaceAccess.prototype, "place", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.Permission),
    (0, typeorm_1.Column)({
        type: "enum",
        enum: enums_1.Permission,
        default: enums_1.Permission.read,
        name: "permission",
    }),
    __metadata("design:type", String)
], PlaceAccess.prototype, "permission", void 0);
exports.PlaceAccess = PlaceAccess = __decorate([
    (0, typeorm_1.Entity)({ name: "place_access" }),
    (0, typeorm_1.Index)(["user", "place"], { unique: true })
], PlaceAccess);
