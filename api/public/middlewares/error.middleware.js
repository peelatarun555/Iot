"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandleAsyncMiddleware = errorHandleAsyncMiddleware;
exports.formatErrorHandler = formatErrorHandler;
const logger_1 = __importDefault(require("@tightec/logger"));
const database_exception_1 = __importDefault(require("@utils/exceptions/database.exception"));
const http_exception_1 = __importStar(require("@utils/exceptions/http.exception"));
const express_jwt_1 = require("express-jwt");
function errorHandleAsyncMiddleware(route) {
    return (req, res, next) => {
        try {
            route(req, res, next);
        }
        catch (e) {
            next(e);
        }
    };
}
function errorMiddleware(error, req, res, next) {
    if (error instanceof http_exception_1.default) {
        const status = error.status;
        const message = error.message;
        res.status(status).json({
            error: error instanceof http_exception_1.ValidationException ? error.errors : message,
        });
        logger_1.default.http(`${res.statusCode} ${req.method} ${req.url} ${message}`);
    }
    else if (error instanceof express_jwt_1.UnauthorizedError) {
        const durations = process.hrtime(req.startTime);
        const duration = Math.round(((durations[0] * 1e6 + durations[1]) / 1e9) * 1000000) / 1000;
        res.status(403).send({ error: "Not authorised: " + error });
        logger_1.default.warn(`${res.statusCode} ${req.method} ${req.url} ${duration}ms`);
    }
    else if (error instanceof SyntaxError) {
        res.status(406).send({ error: error.message });
        logger_1.default.http(`${res.statusCode} ${req.method} ${req.url} ${error.message}`, {
            body: error.stack ?? error.message,
        });
    }
    else if (error instanceof database_exception_1.default) {
        res.status(500).json({
            error: "Something went wrong",
        });
        logger_1.default.error(error.stack ?? error.message);
        throw error;
    }
    else {
        if (error instanceof Error) {
            logger_1.default.error(error.stack ?? error.message);
        }
        else {
            logger_1.default.error(error.toString());
        }
        res.status(500).json({
            error: "Something went wrong",
        });
        throw error;
    }
    next();
}
function formatErrorHandler(formattedError) {
    if (formattedError.extensions?.["code"] == null) {
        logger_1.default.error("UNKOWN ERROR - " + formattedError.message);
    }
    else {
        logger_1.default.http(formattedError.extensions["code"] +
            " - " +
            formattedError.message +
            " - " +
            formattedError.path);
    }
    return {
        ...formattedError,
        extensions: { code: formattedError.extensions?.["code"] },
    };
}
exports.default = errorMiddleware;
