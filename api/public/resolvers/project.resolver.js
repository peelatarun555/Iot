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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectResolver = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const user_middleware_1 = __importDefault(require("@middlewares/user.middleware"));
const project_schema_1 = __importDefault(require("@schemas/project.schema"));
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const user_schema_1 = require("@schemas/user.schema");
const project_service_1 = require("@services/project.service");
const enums_1 = require("@utils/enums");
const project_validation_1 = require("@validations/project.validation");
const type_graphql_1 = require("type-graphql");
let ProjectResolver = class ProjectResolver {
    sensors(project) {
        return project_service_1.ProjectService.getSensors(project.id);
    }
    users(project, user) {
        return project_service_1.ProjectService.getUsers(project, {
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
        });
    }
    projects(user, pagination) {
        return project_service_1.ProjectService.getProjects({
            pagination: pagination,
            userId: user.role != enums_1.Role.admin ? user.id : undefined,
        });
    }
    async project({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await project_service_1.ProjectService.checkUserPermission(id, user.id, enums_1.Permission.read);
        }
        return project_service_1.ProjectService.getProject(id);
    }
    createProject({ name }, options) {
        return project_service_1.ProjectService.createProject(name, options);
    }
    async updateProject({ id }, user, options) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await project_service_1.ProjectService.checkUserPermission(id, user.id, enums_1.Permission.admin);
        }
        return project_service_1.ProjectService.updateProject(id, options);
    }
    async deleteProject({ id }, user) {
        if (!(0, auth_middleware_1.hasRoleAccess)(user.role, enums_1.Role.admin)) {
            await project_service_1.ProjectService.checkUserPermission(id, user.id, enums_1.Permission.admin);
        }
        return project_service_1.ProjectService.deleteProject(id);
    }
};
exports.ProjectResolver = ProjectResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [sensor_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_schema_1.default]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "sensors", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.FieldResolver)(() => [user_schema_1.ProjectUser]),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_schema_1.default, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => [project_schema_1.default]),
    __param(0, (0, user_middleware_1.default)()),
    __param(1, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, project_validation_1.ProjectGetPaginationInput]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "projects", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => project_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_validation_1.ProjectGetArgs, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "project", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.moderator),
    (0, type_graphql_1.Mutation)(() => project_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_validation_1.ProjectCreateArgs,
        project_validation_1.ProjectCreateInput]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "createProject", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Mutation)(() => project_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_validation_1.ProjectUpdateArgs, Object, project_validation_1.ProjectUpdateInput]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "updateProject", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_validation_1.ProjectDeleteArgs, Object]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "deleteProject", null);
exports.ProjectResolver = ProjectResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => project_schema_1.default)
], ProjectResolver);
