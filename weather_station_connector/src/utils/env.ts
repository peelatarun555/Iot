import { cleanEnv, num, port, str, url } from "envalid";

const isProductionEnv = () => process.env.NODE_ENV === "production";
const isTestEnv = () => process.env.NODE_ENV === "test";
const isDevEnv = () => process.env.NODE_ENV === "development";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
  }),
  SYNC_SECONDS: num({ default: 15 }),
  LOG_LEVEL: str({ default: "info" }),
  MBS_HOST: str({ default: "141.26.150.197" }),
  MBS_PORT: port({ default: 502 }),
  MBS_ID: num({ default: 1 }),
  PING_STATUS_URL: str({ default: "" }),
  API_URL: url({ devDefault: "http://nodejs:3000" }),
  API_KEY: str({ devDefault: "passwordpasswordpasswordpassword" }),
  DEVICE_ID: str({ default: "weatherstation" }),
  DEV_EUI: str({ default: "0000000000000001" }),
  SHELLY_IP: str({ default: "141.26.150.218" }),
  SHELLY_PASS: str({ default: "U8sVvJLyUR2ku" }),
  SHELLY_USER: str({ default: "admin" }),
});

export { isDevEnv, isProductionEnv, isTestEnv };
