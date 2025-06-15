"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gRequestSuccess = exports.gRequest = void 0;
exports.initTest = initTest;
require("reflect-metadata");
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../../server"));
const db_helper_1 = require("./db.helper");
const gRequest = (query, authUser) => {
    const request = (0, supertest_1.default)(server_1.default.express)
        .post("/v1/graphql")
        .send({ query: query });
    if (authUser != null) {
        request.set("authorization", "Bearer " + authUser.token);
    }
    return request;
};
exports.gRequest = gRequest;
const gRequestSuccess = (query, authUser) => (0, exports.gRequest)(query, authUser).expect(200);
exports.gRequestSuccess = gRequestSuccess;
async function initTest() {
    await new Promise((resolve) => {
        if (server_1.default.isRunning) {
            resolve();
        }
        server_1.default.express.on("init-complete", () => {
            resolve();
        });
    });
    await (0, db_helper_1.cleanTimescaleDb)();
}
