"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const library_service_1 = __importDefault(require("@services/library.service"));
const logger_1 = __importDefault(require("@tightec/logger"));
const env_1 = require("@utils/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const frostRequestHandler_1 = __importDefault(require("@utils/frostRequestHandler"));
class SocketIoServer {
    static get instance() {
        if (SocketIoServer._instance == null)
            throw new Error("SocketIoServer has not been initialized");
        return SocketIoServer._instance;
    }
    static _instance = null;
    server;
    _io;
    frostHandler = new frostRequestHandler_1.default();
    constructor(server) {
        this.server = server;
        this._io = new socket_io_1.Server(this.server, {
            path: env_1.env.SOCKET_IO_ENDPOINT,
        });
        logger_1.default.info(`Socket.IO is listening on path: ${this._io.path()}`);
        this._registerMiddlewares();
        this._registerSocketEvents();
    }
    static getInstance(server) {
        if (!SocketIoServer._instance && server) {
            SocketIoServer._instance = new SocketIoServer(server);
        }
        else if (!SocketIoServer._instance) {
            throw new Error("SocketIoServer has not been initialized with an application and server");
        }
        return SocketIoServer._instance;
    }
    notifyDataChanges(event, payload) {
        this._io.to("library").emit(event, payload);
    }
    _registerMiddlewares() {
        this._io.use((socket, next) => {
            const isHandshake = socket.handshake != null;
            if (!isHandshake)
                return next();
            const header = socket.handshake.auth;
            let clientIP = socket.handshake.headers["x-forwarded-for"] ?? "";
            if (Array.isArray(clientIP)) {
                clientIP = clientIP[0] || "";
            }
            if (clientIP.startsWith(env_1.env.VALID_IP_V4_PREFIX.toString()) ||
                clientIP.startsWith(env_1.env.VALID_IP_V6_PREFIX.toString())) {
                return next();
            }
            const bearerToken = header ? (header["token"] ?? undefined) : undefined;
            if (!bearerToken)
                return next(new Error("no token"));
            const token = bearerToken.match(/^Bearer (.+)$/);
            if (!token)
                return next(new Error("invalid token"));
            jsonwebtoken_1.default.verify(token[1], env_1.env.JWT_SECRET, (err, decoded) => {
                if (err)
                    return next(new Error("invalid token"));
                if (typeof decoded === "string" || typeof decoded === "undefined")
                    return next(new Error("jwt payload is missing"));
                next();
            });
        });
    }
    _registerSocketEvents() {
        this._io.on("connection", (socket) => {
            logger_1.default.verbose("User connected");
            socket.on("request library data", async () => {
                socket.join("library");
                socket.emit("initial seat states", await library_service_1.default.getInitialStates());
            });
            socket.on("request frost data", async (path) => {
                try {
                    const response = await this.frostHandler.getRequest(path);
                    socket.emit("frost data", response.data);
                }
                catch (error) {
                    logger_1.default.error("Failed to get FROST data", { error: error instanceof Error ? error.message : String(error) });
                    socket.emit("frost data error", { message: error.message });
                }
            });
            socket.on("disconnect", () => {
                logger_1.default.verbose("User disconnected");
            });
        });
    }
}
exports.default = SocketIoServer;
