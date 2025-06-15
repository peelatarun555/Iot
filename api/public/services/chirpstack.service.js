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
const device_grpc_pb_1 = require("@chirpstack/chirpstack-api/api/device_grpc_pb");
const device_pb_1 = __importStar(require("@chirpstack/chirpstack-api/api/device_pb"));
const grpc_js_1 = require("@grpc/grpc-js");
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const env_1 = require("@utils/env");
class ChirpstackService {
    static _instance;
    deviceServiceClient;
    metadata;
    static get instance() {
        return this._instance || (this._instance = new this());
    }
    constructor() {
        this.deviceServiceClient = new device_grpc_pb_1.DeviceServiceClient(env_1.env.CHIRPSTACK_API_URL, grpc_js_1.credentials.createInsecure());
        this.metadata = new grpc_js_1.Metadata();
        this.metadata.set("authorization", "Bearer " + env_1.env.CHIRPSTACK_API_TOKEN);
    }
    async getDevices() {
        const deviceListReq = new device_pb_1.default.ListDevicesRequest();
        return new Promise((resolve, reject) => {
            this.deviceServiceClient.list(deviceListReq, this.metadata, (err, res) => {
                if (err != null) {
                    return reject(err);
                }
                if (res != undefined) {
                    const devicesList = res
                        .getResultList()
                        .map(this.grpcDeviceToDevice);
                    return resolve(devicesList);
                }
                reject("No devices found");
            });
            return undefined;
        });
    }
    async getDevice(devEui) {
        const deviceReq = new device_pb_1.default.GetDeviceRequest();
        deviceReq.setDevEui(devEui);
        return new Promise((resolve, reject) => {
            this.deviceServiceClient.get(deviceReq, this.metadata, (err, resp) => {
                if (err != null) {
                    return reject(err);
                }
                if (resp?.hasDevice()) {
                    const dev = resp.getDevice();
                    if (dev != undefined)
                        return resolve(this.grpcDeviceToDevice(dev));
                }
                reject("No device found");
            });
            return undefined;
        });
    }
    async createDevice(device) {
        const createReq = new device_pb_1.default.CreateDeviceRequest();
        createReq.setDevice(this.deviceToGrpcDevice(device));
        return new Promise((resolve, reject) => {
            this.deviceServiceClient.create(createReq, this.metadata, (err) => {
                if (err != null) {
                    return reject(err);
                }
                resolve();
            });
            return;
        });
    }
    grpcDeviceToDevice(inputDevice) {
        const outputDev = new device_schema_1.default();
        outputDev.name = inputDevice.getName();
        outputDev.devEui = inputDevice.getDevEui();
        outputDev.description = inputDevice.getDescription();
        return outputDev;
    }
    deviceToGrpcDevice(inputDevice) {
        const outputDev = new device_pb_1.Device();
        outputDev.setDevEui(inputDevice.devEui);
        outputDev.setName(inputDevice.name);
        outputDev.setJoinEui("0000000000000000");
        if (inputDevice.description !== undefined) {
            outputDev.setDescription(inputDevice.description);
        }
        return outputDev;
    }
}
exports.default = ChirpstackService;
