"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_client_1 = require("socket.io-client");
const socket_io_server_1 = __importDefault(require("./socket.io/socket-io.server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./../.env" });
let httpServer;
let clientSocket;
beforeAll((done) => {
    httpServer = (0, http_1.createServer)();
    socket_io_server_1.default.getInstance(httpServer);
    httpServer.listen(() => {
        const { port } = httpServer.address();
        clientSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
            path: process.env["SOCKET_IO_ENDPOINT"] ?? "/v1/socket.io",
            auth: {
                token: `Bearer ${process.env["TEST_VALID_JWT"]}`,
            },
            extraHeaders: {
                "x-forwarded-for": process.env["VALID_IP_V4_PREFIX"] ?? "127.0.0.1",
            },
        });
        clientSocket.on("connect", () => done());
        clientSocket.on("connect_error", (err) => done(err));
    });
});
afterAll(() => {
    clientSocket.close();
    httpServer.close();
});
test("should receive initial seat states on 'request library data'", (done) => {
    clientSocket.emit("request library data");
    clientSocket.on("initial seat states", (data) => {
        try {
            expect(data).toBeDefined();
            expect(Array.isArray(data)).toBe(true);
            done();
        }
        catch (err) {
            done(err);
        }
    });
    clientSocket.on("error", (err) => {
        done(err);
    });
});
