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
exports.ProjectUpdateInput = exports.ProjectCreateInput = exports.ProjectGetPaginationInput = exports.ProjectDeleteArgs = exports.ProjectUpdateArgs = exports.ProjectCreateArgs = exports.ProjectGetArgs = void 0;
const enums_1 = require("@utils/enums");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let ProjectGetArgs = class ProjectGetArgs {
    id;
};
exports.ProjectGetArgs = ProjectGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProjectGetArgs.prototype, "id", void 0);
exports.ProjectGetArgs = ProjectGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], ProjectGetArgs);
let ProjectCreateArgs = class ProjectCreateArgs {
    name;
};
exports.ProjectCreateArgs = ProjectCreateArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(3, 64),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], ProjectCreateArgs.prototype, "name", void 0);
exports.ProjectCreateArgs = ProjectCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], ProjectCreateArgs);
let ProjectUpdateArgs = class ProjectUpdateArgs {
    id;
};
exports.ProjectUpdateArgs = ProjectUpdateArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProjectUpdateArgs.prototype, "id", void 0);
exports.ProjectUpdateArgs = ProjectUpdateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], ProjectUpdateArgs);
let ProjectDeleteArgs = class ProjectDeleteArgs {
    id;
};
exports.ProjectDeleteArgs = ProjectDeleteArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProjectDeleteArgs.prototype, "id", void 0);
exports.ProjectDeleteArgs = ProjectDeleteArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], ProjectDeleteArgs);
let ProjectUserInput = class ProjectUserInput {
    userId;
    permission;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ProjectUserInput.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.Permission),
    (0, class_validator_1.IsEnum)(enums_1.Permission),
    __metadata("design:type", String)
], ProjectUserInput.prototype, "permission", void 0);
ProjectUserInput = __decorate([
    (0, type_graphql_1.InputType)()
], ProjectUserInput);
let ProjectGetPaginationInput = class ProjectGetPaginationInput {
    take = 25;
    skip = 0;
};
exports.ProjectGetPaginationInput = ProjectGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Object)
], ProjectGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], ProjectGetPaginationInput.prototype, "skip", void 0);
exports.ProjectGetPaginationInput = ProjectGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], ProjectGetPaginationInput);
let ProjectCreateInput = class ProjectCreateInput {
    users;
    sensors;
};
exports.ProjectCreateInput = ProjectCreateInput;
__decorate([
    (0, type_graphql_1.Field)(() => [ProjectUserInput], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProjectUserInput),
    __metadata("design:type", Array)
], ProjectCreateInput.prototype, "users", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [type_graphql_1.Int], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], ProjectCreateInput.prototype, "sensors", void 0);
exports.ProjectCreateInput = ProjectCreateInput = __decorate([
    (0, type_graphql_1.InputType)()
], ProjectCreateInput);
let ProjectUpdateInput = class ProjectUpdateInput {
    name;
    users;
    sensors;
};
exports.ProjectUpdateInput = ProjectUpdateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(3, 64),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], ProjectUpdateInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [ProjectUserInput], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProjectUserInput),
    __metadata("design:type", Array)
], ProjectUpdateInput.prototype, "users", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [type_graphql_1.Int], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Array)
], ProjectUpdateInput.prototype, "sensors", void 0);
exports.ProjectUpdateInput = ProjectUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], ProjectUpdateInput);
