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
exports.UserResolver = void 0;
const user_middleware_1 = __importDefault(require("@middlewares/user.middleware"));
const project_schema_1 = __importDefault(require("@schemas/project.schema"));
const user_schema_1 = __importDefault(require("@schemas/user.schema"));
const project_service_1 = require("@services/project.service");
const user_service_1 = require("@services/user.service");
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const user_validation_1 = require("@validations/user.validation");
const type_graphql_1 = require("type-graphql");
let UserResolver = class UserResolver {
    projects(user) {
        return project_service_1.ProjectService.getProjects({ userId: user.id });
    }
    loginUser({ email, password }) {
        return user_service_1.UserService.loginUser(email, password);
    }
    async setUserPassword({ email, password, passwordTmp }) {
        await user_service_1.UserService.setUserPassword(email, passwordTmp, password);
        return user_service_1.UserService.loginUser(email, password);
    }
    async resetUserPassword({ email }) {
        await user_service_1.UserService.resetUserPassword(email);
        return true;
    }
    createUser({ email, firstname, lastname }, options) {
        return user_service_1.UserService.createUser(email, firstname, lastname, {
            role: options?.role,
            registeredAt: options?.registeredAt,
            password: options?.password,
        });
    }
    async updateUser({ id }, user, options) {
        if (id != user.id && user.role != enums_1.Role.admin) {
            throw new graphql_exception_1.ForbiddenGraphException();
        }
        if (options != null && Object.entries(options).length > 0)
            await user_service_1.UserService.updateUser(id, options);
        return user_service_1.UserService.getUser(id);
    }
    user({ id }, user) {
        if (id != null && !user_service_1.UserService.hasUserAccessToId(user.id, id, user.role)) {
            throw new graphql_exception_1.ForbiddenGraphException("No access to user with id " + id);
        }
        return user_service_1.UserService.getUser(id ?? user.id);
    }
    users(pagination) {
        return user_service_1.UserService.getUsers({ pagination: pagination });
    }
    async deleteUser({ id }, user) {
        if (id == user.id) {
            throw new graphql_exception_1.BadRequestGraphException("Can not delete self");
        }
        await user_service_1.UserService.getUser(id);
        return user_service_1.UserService.deleteUser(id);
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [project_schema_1.default]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.default]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "projects", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => String),
    __param(0, (0, type_graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserLoginArgs]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "loginUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => String),
    __param(0, (0, type_graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserSetPasswordArgs]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "setUserPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserPasswordResetArgs]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "resetUserPassword", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Mutation)(() => user_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserCreateArgs,
        user_validation_1.UserCreateInput]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "createUser", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Mutation)(() => user_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __param(2, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserUpdateArgs, Object, user_validation_1.UserUpdateInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.default),
    (0, type_graphql_1.Query)(() => user_schema_1.default),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserGetArgs, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => [user_schema_1.default]),
    __param(0, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserGetPaginationInput]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, user_middleware_1.default)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_validation_1.UserDeleteArgs, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => user_schema_1.default)
], UserResolver);
