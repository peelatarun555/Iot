"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class Body {
    static insertDataTTN = joi_1.default.object({
        end_device_ids: joi_1.default.object({
            dev_eui: joi_1.default.string().min(4).max(32).required(),
            device_id: joi_1.default.string().min(2).max(32).required(),
        }).required(),
        received_at: joi_1.default.date(),
        uplink_message: joi_1.default.object({
            frm_payload: joi_1.default.string().min(10).max(1024).required(),
            decoded_payload: joi_1.default.object()
                .keys()
                .pattern(/./, joi_1.default.alternatives(joi_1.default.string(), joi_1.default.number()))
                .required(),
            settings: joi_1.default.object({
                time: joi_1.default.date().required(),
            }).required(),
            rx_metadata: joi_1.default.array().items(joi_1.default.object({
                rssi: joi_1.default.number(),
            })),
        }).required(),
    });
    static insertDataChirp = joi_1.default.object({
        time: joi_1.default.date().required(),
        deviceInfo: joi_1.default.object({
            deviceName: joi_1.default.string().min(2).max(32).required(),
            devEui: joi_1.default.string().min(4).max(32).required(),
        }).required(),
        rxInfo: joi_1.default.array().items(joi_1.default.object({
            rssi: joi_1.default.number().required(),
        })),
        object: joi_1.default.object()
            .keys()
            .pattern(/./, joi_1.default.alternatives(joi_1.default.string(), joi_1.default.number()))
            .required(),
    });
}
exports.default = { Body };
