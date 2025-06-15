"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const logger_1 = __importDefault(require("@tightec/logger"));
const LoggerMiddleware = async ({ info }, next) => {
    const start = Date.now();
    await next();
    if (info.parentType.name != "Query" && info.parentType.name != "Mutation") {
        return;
    }
    const resolveTime = Date.now() - start;
    logger_1.default.http(`${info.operation.operation} ${info.fieldName} [${resolveTime} ms]`);
};
exports.LoggerMiddleware = LoggerMiddleware;
