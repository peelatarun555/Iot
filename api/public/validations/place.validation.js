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
exports.PlacesGetOrderArgs = exports.PlacesGetPaginationArgs = exports.PlacesGetFilterArgs = exports.PlaceDeleteArgs = exports.PlaceUpdateInput = exports.PlaceUpdateArgs = exports.PlaceCreateArgs = exports.PlaceCreateInput = exports.PlaceGetArgs = exports.PlacesGetSearchArgs = exports.PlaceGetPaginationInput = void 0;
const enums_1 = require("@utils/enums");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let PlaceGetPaginationInput = class PlaceGetPaginationInput {
    take = 25;
    skip = 0;
};
exports.PlaceGetPaginationInput = PlaceGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Object)
], PlaceGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], PlaceGetPaginationInput.prototype, "skip", void 0);
exports.PlaceGetPaginationInput = PlaceGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], PlaceGetPaginationInput);
let PlacesGetSearchArgs = class PlacesGetSearchArgs {
    names;
};
exports.PlacesGetSearchArgs = PlacesGetSearchArgs;
__decorate([
    (0, type_graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(50, {
        each: true,
    }),
    __metadata("design:type", Array)
], PlacesGetSearchArgs.prototype, "names", void 0);
exports.PlacesGetSearchArgs = PlacesGetSearchArgs = __decorate([
    (0, type_graphql_1.InputType)()
], PlacesGetSearchArgs);
let PlaceGetArgs = class PlaceGetArgs {
    id;
    name;
};
exports.PlaceGetArgs = PlaceGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaceGetArgs.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaceGetArgs.prototype, "name", void 0);
exports.PlaceGetArgs = PlaceGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], PlaceGetArgs);
let PlaceUserInput = class PlaceUserInput {
    userId;
    permission;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaceUserInput.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.Permission),
    (0, class_validator_1.IsEnum)(enums_1.Permission),
    __metadata("design:type", String)
], PlaceUserInput.prototype, "permission", void 0);
PlaceUserInput = __decorate([
    (0, type_graphql_1.InputType)()
], PlaceUserInput);
let PlaceCreateInput = class PlaceCreateInput {
    parentId;
    users;
};
exports.PlaceCreateInput = PlaceCreateInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaceCreateInput.prototype, "parentId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PlaceUserInput], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlaceUserInput),
    __metadata("design:type", Array)
], PlaceCreateInput.prototype, "users", void 0);
exports.PlaceCreateInput = PlaceCreateInput = __decorate([
    (0, type_graphql_1.InputType)()
], PlaceCreateInput);
let PlaceCreateArgs = class PlaceCreateArgs {
    name;
};
exports.PlaceCreateArgs = PlaceCreateArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 64),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], PlaceCreateArgs.prototype, "name", void 0);
exports.PlaceCreateArgs = PlaceCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], PlaceCreateArgs);
let PlaceUpdateArgs = class PlaceUpdateArgs {
    id;
};
exports.PlaceUpdateArgs = PlaceUpdateArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaceUpdateArgs.prototype, "id", void 0);
exports.PlaceUpdateArgs = PlaceUpdateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], PlaceUpdateArgs);
let PlaceUpdateInput = class PlaceUpdateInput {
    name;
    users;
    parentId;
};
exports.PlaceUpdateInput = PlaceUpdateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 64),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], PlaceUpdateInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PlaceUserInput], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlaceUserInput),
    __metadata("design:type", Array)
], PlaceUpdateInput.prototype, "users", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PlaceUpdateInput.prototype, "parentId", void 0);
exports.PlaceUpdateInput = PlaceUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], PlaceUpdateInput);
let PlaceDeleteArgs = class PlaceDeleteArgs {
    id;
};
exports.PlaceDeleteArgs = PlaceDeleteArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaceDeleteArgs.prototype, "id", void 0);
exports.PlaceDeleteArgs = PlaceDeleteArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], PlaceDeleteArgs);
let PlacesGetFilterArgs = class PlacesGetFilterArgs {
    name;
    parentName;
};
exports.PlacesGetFilterArgs = PlacesGetFilterArgs;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlacesGetFilterArgs.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlacesGetFilterArgs.prototype, "parentName", void 0);
exports.PlacesGetFilterArgs = PlacesGetFilterArgs = __decorate([
    (0, type_graphql_1.InputType)()
], PlacesGetFilterArgs);
let PlacesGetPaginationArgs = class PlacesGetPaginationArgs {
    index = 0;
    take = 25;
};
exports.PlacesGetPaginationArgs = PlacesGetPaginationArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], PlacesGetPaginationArgs.prototype, "index", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], PlacesGetPaginationArgs.prototype, "take", void 0);
exports.PlacesGetPaginationArgs = PlacesGetPaginationArgs = __decorate([
    (0, type_graphql_1.InputType)()
], PlacesGetPaginationArgs);
let PlacesGetOrderArgs = class PlacesGetOrderArgs {
    orderBy;
    ascending;
};
exports.PlacesGetOrderArgs = PlacesGetOrderArgs;
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlacesGetOrderArgs.prototype, "orderBy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PlacesGetOrderArgs.prototype, "ascending", void 0);
exports.PlacesGetOrderArgs = PlacesGetOrderArgs = __decorate([
    (0, type_graphql_1.InputType)()
], PlacesGetOrderArgs);
