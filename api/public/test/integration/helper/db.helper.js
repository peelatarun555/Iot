"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanTimescaleDb = cleanTimescaleDb;
exports.createTestUsers = createTestUsers;
require("reflect-metadata");
const timescaledb_datasource_1 = require("@db/timescaledb/timescaledb.datasource");
const user_service_1 = require("@services/user.service");
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const database_exception_1 = __importDefault(require("@utils/exceptions/database.exception"));
async function cleanTimescaleDb() {
    try {
        await timescaledb_datasource_1.datasource.query(`
       TRUNCATE TABLE "users", "places", "datapoints", "datasources", "devices", "sensors", "projects", "place_access", "project_access", "locations" RESTART IDENTITY CASCADE;
    `);
        logger_1.default.info("TIMESCALEDB TEST DATABASE: Clean");
    }
    catch (error) {
        throw new database_exception_1.default(`TimescaleDb cleaning error: ${error}`);
    }
}
async function createTestUsers() {
    const response = await Promise.all([
        user_service_1.UserService.createUser("admin@eotlab.de", "admin", "admin", {
            role: enums_1.Role.admin,
            password: "password",
        }),
        user_service_1.UserService.createUser("default@eotlab.de", "default", "default", {
            role: enums_1.Role.default,
            password: "password",
        }),
        user_service_1.UserService.createUser("moderator@eotlab.de", "moderator", "moderator", {
            role: enums_1.Role.moderator,
            password: "password",
        }),
        user_service_1.UserService.createUser("moderator2@eotlab.de", "moderator2", "moderator2", {
            role: enums_1.Role.moderator,
            password: "password",
        }),
    ]);
    const tokens = await Promise.all([
        user_service_1.UserService.loginUser("admin@eotlab.de", "password"),
        user_service_1.UserService.loginUser("default@eotlab.de", "password"),
        user_service_1.UserService.loginUser("moderator@eotlab.de", "password"),
        user_service_1.UserService.loginUser("moderator2@eotlab.de", "password"),
    ]);
    return {
        admin: { user: response[0], token: tokens[0] },
        default: { user: response[1], token: tokens[1] },
        moderator: { user: response[2], token: tokens[2] },
        moderator2: { user: response[3], token: tokens[3] },
    };
}
