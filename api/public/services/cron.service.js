"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const logger_1 = __importDefault(require("@tightec/logger"));
const device_service_1 = require("./device.service");
class CronService {
    constructor() {
        new cron_1.CronJob("5 0 0 * * *", () => {
            this.executeDayly();
        }, null, true, undefined, undefined, true);
    }
    async executeDayly() {
        logger_1.default.verbose("Execute cron dayly");
        await device_service_1.DeviceService.permanentlyDeleteDevices();
    }
}
exports.default = CronService;
