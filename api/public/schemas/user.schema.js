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
var ProjectUser_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectUser = void 0;
const enums_1 = require("@utils/enums");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const place_schema_1 = require("./place.schema");
const project_schema_1 = require("./project.schema");
let User = class User extends typeorm_1.BaseEntity {
    id;
    firstname;
    lastname;
    email;
    password;
    passwordTmp;
    lastPasswordResetAt;
    registeredAt;
    role;
    projectAccess;
    placeAccess;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, name: "firstname" }),
    __metadata("design:type", String)
], User.prototype, "firstname", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, name: "lastname" }),
    __metadata("design:type", String)
], User.prototype, "lastname", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 64, unique: true, name: "email" }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ length: 72, nullable: true, name: "password" }),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ length: 16, nullable: true, name: "password_tmp" }),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", String)
], User.prototype, "passwordTmp", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    (0, typeorm_1.Column)({
        type: "timestamptz",
        nullable: true,
        name: "last_password_reset_at",
    }),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", Date)
], User.prototype, "lastPasswordResetAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)({ type: "timestamptz", name: "registered_at" }),
    __metadata("design:type", Date)
], User.prototype, "registeredAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.Role),
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.Role, default: enums_1.Role.default, name: "role" }),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_schema_1.ProjectAccess, (projectAccess) => projectAccess.user),
    __metadata("design:type", Array)
], User.prototype, "projectAccess", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => place_schema_1.PlaceAccess, (placeAccess) => placeAccess.user),
    __metadata("design:type", Array)
], User.prototype, "placeAccess", void 0);
User = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)({ name: "users" })
], User);
exports.default = User;
let ProjectUser = ProjectUser_1 = class ProjectUser extends User {
    static fromUser(user, permission) {
        const projectUser = new ProjectUser_1();
        projectUser.id = user.id;
        projectUser.email = user.email;
        projectUser.lastname = user.lastname;
        projectUser.firstname = user.firstname;
        projectUser.password = user.password;
        projectUser.passwordTmp = user.passwordTmp;
        projectUser.lastPasswordResetAt = user.lastPasswordResetAt;
        projectUser.registeredAt = user.registeredAt;
        projectUser.role = user.role;
        projectUser.projectAccess = user.projectAccess;
        projectUser.permission = permission;
        return projectUser;
    }
    permission;
};
exports.ProjectUser = ProjectUser;
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.Permission),
    __metadata("design:type", String)
], ProjectUser.prototype, "permission", void 0);
exports.ProjectUser = ProjectUser = ProjectUser_1 = __decorate([
    (0, type_graphql_1.ObjectType)()
], ProjectUser);
