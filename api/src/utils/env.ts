import dotenv from "dotenv";
import { bool, cleanEnv, email, port, str } from "envalid";

dotenv.config({ path: "./../../../.env" });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "production", "test"], devDefault: "development" }),
  KEYCLOAK_CERT_URL: str({
    devDefault: "http://localhost:8080/realms/dataplatform/protocol/openid-connect/certs",
  }),
  FROST_SERVER_URL: str({
    desc: "FROST Server REST API URL",
    example: "https://api.eotlab.uni-koblenz.de/v1.1",
    default: ""
  }),
  FROST_AUTH_URL: str({
    desc: "FROST Server OAuth2 token endpoint",
    example: "https://api.eotlab.uni-koblenz.de/auth/realms/dataplatform/protocol/openid-connect/token",
    default: ""
  }),
  FROST_CLIENT_ID: str({
    desc: "FROST Server OAuth2 client ID",
    example: "frost-client",
    default: ""
  }),
  FROST_CLIENT_SECRET: str({
    desc: "FROST Server OAuth2 client secret",
    example: "secret123",
    default: ""
  }),
  FROST_USERNAME: str({
    desc: "FROST Server username",
    default: ""
  }),
  FROST_PASSWORD: str({
    desc: "FROST Server password",
    default: ""
  }),
  FROST_SCOPE: str({
    desc: "FROST Server OAuth2 scope",
    default: "openid"
  }),
  FROST_MQTT_BROKER_URL: str({
    desc: "FROST Server MQTT broker URL",
    example: "mqtt://frost.api.eotlab.uni-koblenz.de:1883",
    default: ""
  }),
  LOG_LEVEL: str({ default: "info" }),
  LOCAL_TEST: bool({ default: false }),
  PORT: port({ default: 3000 }),
  JWT_SECRET: str({
    desc: "Secret key for JWT token signing",
    example: "super_secure_secret_123",
    devDefault: "dev_jwt_secret"
  }),
  JWT_EXPIRES_IN: str({
    desc: "JWT token expiration time",
    default: "1h",
    choices: ["15m", "1h", "24h"]
  }),
  SUPER_USER: str({ default: "notset" }),
  SUPER_PASSWORD: str({ default: "notset" }),
  POSTGRES_PORT: port({ default: 5432 }),
  POSTGRES_HOST: str({ default: "postgresql" }),
  POSTGRES_USER: str({ devDefault: "api" }),
  POSTGRES_PASSWORD: str({ devDefault: "password" }),
  POSTGRES_DB: str({ default: "eotlab" }),
  POSTGRES_SSL: bool({ default: false }),
  CHIRPSTACK_API_TOKEN: str({ devDefault: "password" }),
  CHIRPSTACK_API_URL: str({ default: "chirpstack.data.eotlab.uni-koblenz.de" }),
  CHIRPSTACK_PING_STATUS_URL: str({ default: "" }),
  TTN_PING_STATUS_URL: str({ default: "" }),
  EMAIL_ADDRESS_SMTP: email({ devDefault: "test@eotlab.de" }),
  EMAIL_PORT_SMTP: port({ default: 465 }),
  EMAIL_PASSWORD_SMTP: str({ devDefault: "password" }),
  EMAIL_SERVER_SMTP: str({ devDefault: "mailhog" }),
  WEATHER_STATION_DEVICE_ID: str({ devDefault: "weather-station-01", default: "" }),
  WEATHER_STATION_DEV_EUI: str({ devDefault: "Weather Station", default: "" }),
  WEATHER_STATION_API_KEY: str({ devDefault: "password", default: "" }),
  SOCKET_IO_ENDPOINT: str({ default: "/v1/socket.io" }),
  VALID_IP_V4_PREFIX: str({ devDefault: "127.0.0.1" }),
  VALID_IP_V6_PREFIX: str({ devDefault: "::1" }),
  MQTT_BROKER_URL: str({
    desc: "MQTT broker connection URL",
    example: "mqtt://api.eotlab.uni-koblenz.de:1883",
    default: "mqtt://api.eotlab.uni-koblenz.de:1883"
  }),
  MQTT_USERNAME: str({ desc: "MQTT broker username", default: "" }),
  MQTT_PASSWORD: str({ desc: "MQTT broker password", default: "" }),

});

export const isProductionEnv = () => env.NODE_ENV === "production";
export const isTestEnv = () => env.NODE_ENV === "test";
export const isDevEnv = () => env.NODE_ENV === "development";
