"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevEnv = exports.isTestEnv = exports.isProductionEnv = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const envalid_1 = require("envalid");
dotenv_1.default.config({ path: "./../../../.env" });
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    NODE_ENV: (0, envalid_1.str)({
        choices: ["development", "production", "test"],
        devDefault: "development",
    }),
    TEST_VALID_JWT: (0, envalid_1.str)(),
    KEYCLOAK_CERT_URL: (0, envalid_1.str)({
        devDefault: "http://localhost:8080/realms/dataplatform/protocol/openid-connect/certs",
    }),
    LOG_LEVEL: (0, envalid_1.str)({ default: "info" }),
    LOCAL_TEST: (0, envalid_1.bool)({ default: false }),
    PORT: (0, envalid_1.port)({ default: 3000 }),
    JWT_SECRET: (0, envalid_1.str)({ devDefault: "password" }),
    SUPER_USER: (0, envalid_1.str)({ default: "notset" }),
    SUPER_PASSWORD: (0, envalid_1.str)({ default: "notset" }),
    POSTGRES_PORT: (0, envalid_1.port)({ default: 5432 }),
    POSTGRES_HOST: (0, envalid_1.str)({ default: "postgresql" }),
    POSTGRES_USER: (0, envalid_1.str)({ devDefault: "api" }),
    POSTGRES_PASSWORD: (0, envalid_1.str)({ devDefault: "password" }),
    POSTGRES_DB: (0, envalid_1.str)({ default: "eotlab" }),
    FROST_USER: (0, envalid_1.str)({ devDefault: "tpeela@uni-koblenz.de" }),
    FROST_PASS: (0, envalid_1.str)({ devDefault: "Sasipeela@123" }),
    POSTGRES_SSL: (0, envalid_1.bool)({ default: false }),
    CHIRPSTACK_API_TOKEN: (0, envalid_1.str)({ devDefault: "password" }),
    CHIRPSTACK_API_URL: (0, envalid_1.str)({ default: "chirpstack.data.eotlab.uni-koblenz.de" }),
    EMAIL_ADDRESS_SMTP: (0, envalid_1.email)({ devDefault: "test@eotlab.de" }),
    EMAIL_PORT_SMTP: (0, envalid_1.port)({ default: 465 }),
    EMAIL_PASSWORD_SMTP: (0, envalid_1.str)({ devDefault: "password" }),
    EMAIL_SERVER_SMTP: (0, envalid_1.str)({ devDefault: "mailhog" }),
    CHIRPSTACK_PING_STATUS_URL: (0, envalid_1.str)({ default: "" }),
    TTN_PING_STATUS_URL: (0, envalid_1.str)({ default: "" }),
    WEATHER_STATION_DEVICE_ID: (0, envalid_1.str)({
        devDefault: "weather-station-01",
        default: "",
    }),
    WEATHER_STATION_DEV_EUI: (0, envalid_1.str)({ devDefault: "Weather Station", default: "" }),
    WEATHER_STATION_API_KEY: (0, envalid_1.str)({ devDefault: "password", default: "" }),
    SOCKET_IO_ENDPOINT: (0, envalid_1.str)({ default: "/v1/socket.io" }),
    VALID_IP_V4_PREFIX: (0, envalid_1.str)({ devDefault: "127.0.0.1" }),
    VALID_IP_V6_PREFIX: (0, envalid_1.str)({ devDefault: "::1" }),
});
const isProductionEnv = () => exports.env.NODE_ENV === "production";
exports.isProductionEnv = isProductionEnv;
const isTestEnv = () => exports.env.NODE_ENV === "test";
exports.isTestEnv = isTestEnv;
const isDevEnv = () => exports.env.NODE_ENV === "development";
exports.isDevEnv = isDevEnv;
