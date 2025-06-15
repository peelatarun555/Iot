"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthChecker = void 0;
exports.hasRoleAccess = hasRoleAccess;
exports.hasPermissionAccess = hasPermissionAccess;
exports.authenticateApiToken = authenticateApiToken;
const datasource_schema_1 = require("@schemas/datasource.schema");
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const http_exception_1 = require("@utils/exceptions/http.exception");
const joi_1 = __importDefault(require("joi"));
class AuthChecker {
    check({ context }, roles) {
        const jwtUser = context.user;
        if (!jwtUser) {
            throw new graphql_exception_1.ForbiddenGraphException("Forbidden Access - No jwt user was given");
        }
        if (jwtUser.id == null || !Object.values(enums_1.Role).includes(jwtUser.role)) {
            throw new graphql_exception_1.BadRequestGraphException("Token has a wrong format!");
        }
        if (!hasRoleAccess(jwtUser.role, roles[0])) {
            throw new graphql_exception_1.ForbiddenGraphException("Role " + jwtUser.role + " is below " + roles[0]);
        }
        return true;
    }
}
exports.AuthChecker = AuthChecker;
function hasRoleAccess(isRole, targetRole) {
    function roleNumber(role) {
        switch (role) {
            case enums_1.Role.admin:
                return 0;
            case enums_1.Role.moderator:
                return 1;
            default:
                return 2;
        }
    }
    return roleNumber(isRole) <= roleNumber(targetRole);
}
function hasPermissionAccess(isPermission, targetPermission) {
    function permissionNumber(permission) {
        switch (permission) {
            case enums_1.Permission.admin:
                return 0;
            case enums_1.Permission.write:
                return 1;
            default:
                return 2;
        }
    }
    return permissionNumber(isPermission) <= permissionNumber(targetPermission);
}
function authenticateApiToken() {
    return async (req, _res, next) => {
        let apiKey = req.headers["api-key"];
        if (!apiKey) {
            return next(new http_exception_1.AuthException("Token is missing"));
        }
        try {
            await joi_1.default.string()
                .min(32)
                .max(128)
                .alphanum()
                .message("apiKey validation error")
                .validateAsync(apiKey, {
                abortEarly: false,
                allowUnknown: true,
                stripUnknown: true,
            });
        }
        catch (err) {
            const errors = [];
            err.details.forEach((error) => {
                errors.push(error.message.toString());
            });
            return next(new http_exception_1.ValidationException(errors));
        }
        if (apiKey instanceof Array) {
            apiKey = apiKey.join("");
        }
        const datasource = await datasource_schema_1.Datasource.findOneBy({
            token: apiKey,
        });
        if (!datasource) {
            return next(new http_exception_1.AuthException("Token is invalid: DataSource missing"));
        }
        if (new Date().getTime() > datasource.expiresAt.getTime()) {
            return next(new http_exception_1.AuthException("Token is expired"));
        }
        return next();
    };
}
