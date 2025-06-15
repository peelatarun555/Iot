"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseTimeoutException = exports.DatabaseRefusedException = exports.DatabaseLostConnectionException = exports.DatabaseCountException = void 0;
class DatabaseException extends Error {
    message;
    error;
    constructor(message, error) {
        super(message);
        this.message = message;
        this.error = error;
    }
}
class DatabaseTimeoutException extends DatabaseException {
    constructor(message, error) {
        super(message ?? "Database connection timed out", error);
    }
}
exports.DatabaseTimeoutException = DatabaseTimeoutException;
class DatabaseRefusedException extends DatabaseException {
    constructor(message, error) {
        super(message ?? "Database refused connection", error);
    }
}
exports.DatabaseRefusedException = DatabaseRefusedException;
class DatabaseCountException extends DatabaseException {
    constructor(message, error) {
        super(message ?? "Database has too many connections", error);
    }
}
exports.DatabaseCountException = DatabaseCountException;
class DatabaseLostConnectionException extends DatabaseException {
    constructor(message, error) {
        super(message ?? "Database lost connection", error);
    }
}
exports.DatabaseLostConnectionException = DatabaseLostConnectionException;
exports.default = DatabaseException;
