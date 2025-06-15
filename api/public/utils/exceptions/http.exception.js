"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = exports.NotInTimeException = exports.NotFoundException = exports.ForbiddenException = exports.BadRequestException = exports.AuthException = exports.AlreadyExistsException = void 0;
class HttpException extends Error {
    status;
    message;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
class ValidationException extends HttpException {
    errors;
    constructor(errors) {
        super(422, errors.toString());
        this.errors = errors;
    }
}
exports.ValidationException = ValidationException;
class AuthException extends HttpException {
    constructor(message = "Not Authorized") {
        super(401, message);
    }
}
exports.AuthException = AuthException;
class NotFoundException extends HttpException {
    constructor(message = "Not Found") {
        super(404, message);
    }
}
exports.NotFoundException = NotFoundException;
class ForbiddenException extends HttpException {
    constructor(message = "Forbidden") {
        super(403, message);
    }
}
exports.ForbiddenException = ForbiddenException;
class BadRequestException extends HttpException {
    constructor(message = "Bad Request") {
        super(400, message);
    }
}
exports.BadRequestException = BadRequestException;
class AlreadyExistsException extends HttpException {
    constructor(message = "Already exists") {
        super(409, message);
    }
}
exports.AlreadyExistsException = AlreadyExistsException;
class NotInTimeException extends HttpException {
    constructor(message = "Not in time") {
        super(423, message);
    }
}
exports.NotInTimeException = NotInTimeException;
exports.default = HttpException;
