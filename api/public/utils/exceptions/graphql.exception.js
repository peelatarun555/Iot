"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationGraphException = exports.NotFoundGraphException = exports.ForbiddenGraphException = exports.BadRequestGraphException = exports.AuthGraphException = void 0;
const GraphQLError_1 = require("graphql/error/GraphQLError");
class ForbiddenGraphException extends GraphQLError_1.GraphQLError {
    constructor(message) {
        super(message ?? "Forbidden", { extensions: { code: "FORBIDDEN" } });
    }
}
exports.ForbiddenGraphException = ForbiddenGraphException;
class BadRequestGraphException extends GraphQLError_1.GraphQLError {
    constructor(message) {
        super(message ?? "Bad Request", { extensions: { code: "BAD_REQUEST" } });
    }
}
exports.BadRequestGraphException = BadRequestGraphException;
class ValidationGraphException extends GraphQLError_1.GraphQLError {
    constructor(message) {
        super(message ?? "Validation failed", {
            extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
        });
    }
}
exports.ValidationGraphException = ValidationGraphException;
class AuthGraphException extends GraphQLError_1.GraphQLError {
    constructor(message) {
        super(message ?? "Not Authorized", {
            extensions: { code: "UNAUTHORIZED" },
        });
    }
}
exports.AuthGraphException = AuthGraphException;
class NotFoundGraphException extends GraphQLError_1.GraphQLError {
    constructor(message) {
        super(message ?? "Not found", { extensions: { code: "NOT_FOUND" } });
    }
}
exports.NotFoundGraphException = NotFoundGraphException;
