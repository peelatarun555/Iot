"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = __importDefault(require("@schemas/user.schema"));
const datapoint_service_1 = require("@services/datapoint.service");
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const user_service_1 = require("@services/user.service");
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
class DbSeeder {
    static async init() {
        if (await user_schema_1.default.findOneBy({ email: "admin@admin.com" })) {
            return;
        }
        logger_1.default.info("Seed db data ...");
        await user_service_1.UserService.createUser("admin@admin.com", "admin", "admin", {
            role: enums_1.Role.admin,
            password: "password",
        });
        const place = await place_service_1.default.createPlace("Testplace");
        const device = await device_service_1.DeviceService.createDevice("Testdevice", "testdevice", "testtype", enums_1.DeviceStatus.production, place.id, {
            sensors: [
                {
                    name: "Testsensor",
                    sensorType: "temperature",
                },
            ],
        });
        await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 12);
    }
}
exports.default = DbSeeder;
