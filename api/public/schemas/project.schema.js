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
exports.ProjectAccess = void 0;
const enums_1 = require("@utils/enums");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const sensor_schema_1 = __importDefault(require("./sensor.schema"));
const user_schema_1 = __importDefault(require("./user.schema"));
let Project = class Project extends typeorm_1.BaseEntity {
    id;
    name;
    projectAccess;
    sensors;
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    __metadata("design:type", Number)
], Project.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ length: 32, unique: true, name: "name" }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProjectAccess, (projectAccess) => projectAccess.project),
    __metadata("design:type", Array)
], Project.prototype, "projectAccess", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => sensor_schema_1.default, { cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: "project_sensors",
        joinColumn: { name: "project_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "sensor_id", referencedColumnName: "id" },
    }),
    __metadata("design:type", Array)
], Project.prototype, "sensors", void 0);
Project = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)("projects")
], Project);
exports.default = Project;
let ProjectAccess = class ProjectAccess extends typeorm_1.BaseEntity {
    id;
    user;
    project;
    permission;
};
exports.ProjectAccess = ProjectAccess;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id" }),
    __metadata("design:type", Number)
], ProjectAccess.prototype, "id", void 0);
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
], ProjectAccess.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Project),
    (0, typeorm_1.ManyToOne)(() => Project, (project) => project.id, {
        cascade: true,
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", Project)
], ProjectAccess.prototype, "project", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => enums_1.Permission),
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.Permission, default: enums_1.Permission.read }),
    __metadata("design:type", String)
], ProjectAccess.prototype, "permission", void 0);
exports.ProjectAccess = ProjectAccess = __decorate([
    (0, typeorm_1.Entity)({ name: "project_access" }),
    (0, typeorm_1.Index)(["project", "user"], { unique: true })
], ProjectAccess);
