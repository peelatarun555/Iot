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
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const disabled_1 = require("@apollo/server/plugin/disabled");
const default_1 = require("@apollo/server/plugin/landingPage/default");
const data_controller_1 = __importDefault(require("@controller/data.controller"));
const library_seeder_db_1 = __importDefault(require("@db/library_seeder.db"));
const seeder_db_1 = __importDefault(require("@db/seeder.db"));
const auth_middleware_1 = require("@middlewares/auth.middleware");
const error_middleware_1 = __importStar(require("@middlewares/error.middleware"));
const logger_middleware_1 = require("@middlewares/logger.middleware");
const resolvers_1 = require("@resolvers/resolvers");
const cron_service_1 = __importDefault(require("@services/cron.service"));
const timescaledb_service_1 = __importDefault(require("@services/timescaledb.service"));
const user_service_1 = require("@services/user.service");
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const env_1 = require("@utils/env");
const http_exception_1 = require("@utils/exceptions/http.exception");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const express_jwt_1 = require("express-jwt");
const http_1 = __importDefault(require("http"));
const jwks_rsa_1 = require("jwks-rsa");
const type_graphql_1 = require("type-graphql");
const socket_io_server_1 = __importDefault(require("./socket.io/socket-io.server"));
class App {
    express;
    server;
    socketIOServer;
    isRunning = false;
    constructor() {
        this.express = (0, express_1.default)();
        this.server = http_1.default.createServer(this.express);
        this.socketIOServer = socket_io_server_1.default.getInstance(this.server);
        this.mountRoutes();
    }
    mountRoutes() {
        const router = express_1.default.Router();
        router.get(env_1.env.SOCKET_IO_ENDPOINT, (_, res) => {
            res.send("This is the socket endpoint!");
        });
        this.express.use("/", router);
    }
    async init() {
        logger_1.default.configure({
            logLevel: env_1.env.LOG_LEVEL,
        });
        this.initialiseMiddleware();
        logger_1.default.verbose("Database init ...");
        await this.initialiseDatabases();
        logger_1.default.verbose("Graphql server init ...");
        await this.initialiseGraphQl();
        this.initialiseController();
        this.catchNotFound();
        this.initialiseErrorHandling();
        new cron_service_1.default();
        logger_1.default.verbose("Express init complete");
        try {
            if ((0, env_1.isDevEnv)())
                await seeder_db_1.default.init();
        }
        catch (err) {
            logger_1.default.error("Error while initializing DbSeeder" + err);
        }
        try {
            await library_seeder_db_1.default.seed();
        }
        catch (err) {
            logger_1.default.error("Error while seeding library place: " + err);
        }
        this.initAdminByEnv();
        this.express.get("/health", (_req, res) => {
            res.send("OK");
        });
        this.express.emit("init-complete");
        this.isRunning = true;
    }
    initialiseController() {
        this.express.use("/v1", new data_controller_1.default().router);
    }
    async initAdminByEnv() {
        if (env_1.env.SUPER_USER == "notset" || env_1.env.SUPER_PASSWORD == "notset")
            return;
        try {
            await user_service_1.UserService.getUserByEmail(env_1.env.SUPER_USER);
        }
        catch {
            await user_service_1.UserService.createUser(env_1.env.SUPER_USER, "admin", "admin", {
                role: enums_1.Role.admin,
                password: env_1.env.SUPER_PASSWORD,
            });
            logger_1.default.info("Admin user " + env_1.env.SUPER_USER + " was created!");
        }
    }
    async initialiseDatabases(tries = 0) {
        try {
            await timescaledb_service_1.default.initConnection();
        }
        catch (err) {
            if (tries > 5) {
                logger_1.default.error("Error while initializing TimescaleDBService" + err);
                throw err;
            }
            else {
                logger_1.default.warn("Retrying to connect to TimescaleDBService after 5s at " +
                    env_1.env.POSTGRES_HOST +
                    ":" +
                    env_1.env.POSTGRES_PORT);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                return await this.initialiseDatabases(tries + 1);
            }
        }
    }
    initialiseMiddleware() {
        this.express.use((0, cors_1.default)());
        this.express.use((0, express_1.json)({ limit: "100kb", strict: true }));
        this.express.use((0, express_1.urlencoded)({ extended: false, parameterLimit: 500 }));
        this.express.use((0, compression_1.default)());
    }
    initialiseErrorHandling() {
        this.express.use(error_middleware_1.default);
    }
    async getSecret(req, token) {
        if (req.headers["x-id-token"] == null) {
            return env_1.env.JWT_SECRET;
        }
        return (0, jwks_rsa_1.expressJwtSecret)({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: env_1.env.KEYCLOAK_CERT_URL,
            requestAgent: new http_1.default.Agent({ keepAlive: true, family: 4 }),
        })(req, token);
    }
    async initialiseGraphQl() {
        const server = new server_1.ApolloServer({
            schema: await (0, type_graphql_1.buildSchema)({
                resolvers: resolvers_1.resolvers,
                authChecker: auth_middleware_1.AuthChecker,
                globalMiddlewares: [logger_middleware_1.LoggerMiddleware],
            }),
            formatError: error_middleware_1.formatErrorHandler,
            plugins: [
                (0, env_1.isProductionEnv)()
                    ? (0, disabled_1.ApolloServerPluginLandingPageDisabled)()
                    : (0, default_1.ApolloServerPluginLandingPageLocalDefault)({
                        embed: true,
                        footer: false,
                    }),
            ],
        });
        await server.start();
        this.express.all("/v1/graphql", (0, express_jwt_1.expressjwt)({
            secret: this.getSecret,
            algorithms: ["HS256"],
            credentialsRequired: false,
        }), (0, express4_1.expressMiddleware)(server, {
            context: async ({ req }) => {
                return { req, user: req.auth };
            },
        }));
    }
    catchNotFound() {
        this.express.use(function (_req, _res, next) {
            next(new http_exception_1.NotFoundException("Path not found!"));
        });
    }
    listen() {
        this.express.on("init-complete", () => {
            this.server.listen(env_1.env.PORT, () => {
                logger_1.default.info("App runs on port " + env_1.env.PORT + " with NODE_ENV: " + env_1.env.NODE_ENV);
            });
        });
        this.init();
    }
}
exports.default = new App();
