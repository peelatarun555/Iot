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
exports.datasource = void 0;
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const datasource_schema_1 = require("@schemas/datasource.schema");
const device_schema_1 = __importStar(require("@schemas/device.schema"));
const location_schema_1 = __importDefault(require("@schemas/location.schema"));
const place_schema_1 = __importStar(require("@schemas/place.schema"));
const project_schema_1 = __importStar(require("@schemas/project.schema"));
const sensor_schema_1 = __importStar(require("@schemas/sensor.schema"));
const user_schema_1 = __importDefault(require("@schemas/user.schema"));
const env_1 = require("@utils/env");
const typeorm_1 = require("typeorm");
exports.datasource = new typeorm_1.DataSource({
    type: "postgres",
    ssl: env_1.env.POSTGRES_SSL
        ? {
            rejectUnauthorized: false,
            requestCert: true,
        }
        : false,
    host: env_1.env.POSTGRES_HOST,
    username: env_1.env.POSTGRES_USER,
    password: env_1.env.POSTGRES_PASSWORD,
    database: env_1.env.POSTGRES_DB,
    port: env_1.env.POSTGRES_PORT,
    dropSchema: (0, env_1.isTestEnv)(),
    migrations: [__dirname + "/migration/**"],
    entities: [
        datapoint_schema_1.Datapoint,
        user_schema_1.default,
        place_schema_1.default,
        place_schema_1.PlaceAccess,
        project_schema_1.default,
        project_schema_1.ProjectAccess,
        device_schema_1.DeviceType,
        sensor_schema_1.SensorType,
        device_schema_1.default,
        sensor_schema_1.default,
        datasource_schema_1.Datasource,
        location_schema_1.default,
    ],
    synchronize: false,
    migrationsRun: true,
    logging: false,
    logger: "simple-console",
});
