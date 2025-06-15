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
exports.DatasourceUpdateInput = exports.DatasourceCreateInput = exports.DatasourceUpdateArgs = exports.DatasourceDeleteArgs = exports.DatasourceCreateArgs = exports.DatasoruceGetPaginationInput = void 0;
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let DatasoruceGetPaginationInput = class DatasoruceGetPaginationInput {
    take = 25;
    skip = 0;
};
exports.DatasoruceGetPaginationInput = DatasoruceGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Object)
], DatasoruceGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], DatasoruceGetPaginationInput.prototype, "skip", void 0);
exports.DatasoruceGetPaginationInput = DatasoruceGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], DatasoruceGetPaginationInput);
let DatasourceCreateArgs = class DatasourceCreateArgs {
    name;
};
exports.DatasourceCreateArgs = DatasourceCreateArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 32),
    __metadata("design:type", String)
], DatasourceCreateArgs.prototype, "name", void 0);
exports.DatasourceCreateArgs = DatasourceCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatasourceCreateArgs);
let DatasourceDeleteArgs = class DatasourceDeleteArgs {
    id;
};
exports.DatasourceDeleteArgs = DatasourceDeleteArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DatasourceDeleteArgs.prototype, "id", void 0);
exports.DatasourceDeleteArgs = DatasourceDeleteArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatasourceDeleteArgs);
let DatasourceUpdateArgs = class DatasourceUpdateArgs {
    id;
};
exports.DatasourceUpdateArgs = DatasourceUpdateArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DatasourceUpdateArgs.prototype, "id", void 0);
exports.DatasourceUpdateArgs = DatasourceUpdateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], DatasourceUpdateArgs);
let DatasourceCreateInput = class DatasourceCreateInput {
    expiresAt;
    token;
};
exports.DatasourceCreateInput = DatasourceCreateInput;
__decorate([
    (0, type_graphql_1.Field)(() => Date, {
        defaultValue: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
    }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DatasourceCreateInput.prototype, "expiresAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(64, 128),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DatasourceCreateInput.prototype, "token", void 0);
exports.DatasourceCreateInput = DatasourceCreateInput = __decorate([
    (0, type_graphql_1.InputType)()
], DatasourceCreateInput);
let DatasourceUpdateInput = class DatasourceUpdateInput {
    expiresAt;
    name;
    token;
};
exports.DatasourceUpdateInput = DatasourceUpdateInput;
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DatasourceUpdateInput.prototype, "expiresAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 32),
    __metadata("design:type", String)
], DatasourceUpdateInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(64, 128),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], DatasourceUpdateInput.prototype, "token", void 0);
exports.DatasourceUpdateInput = DatasourceUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], DatasourceUpdateInput);
