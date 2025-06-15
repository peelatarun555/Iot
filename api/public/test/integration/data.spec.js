"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const server_1 = __importDefault(require("../../server"));
const supertest_1 = __importDefault(require("supertest"));
const datasource_service_1 = require("@services/datasource.service");
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const enums_1 = require("@utils/enums");
const mocha_1 = require("mocha");
const server_helper_1 = require("./helper/server.helper");
(0, mocha_1.describe)("Test data controller", () => {
    let datasource;
    let place;
    before(async () => {
        await (0, server_helper_1.initTest)();
        datasource = await datasource_service_1.DatasourceService.createDatasource("Endpoints test");
        place = await place_service_1.default.createPlace("Place");
    });
    it("TTN: No api Key was provided, should not be able to access", async () => {
        await (0, supertest_1.default)(server_1.default.express).post("/v1/data/ttn").expect(401);
    });
    it("TTN: Wrong api Key was provided, should not be able to access", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", "aljshdljhgkjghlkhlhgkhjkjashdkjlas")
            .expect(401);
    });
    it("TTN: Should not be able to access if validation failed", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({})
            .expect(422);
    });
    it("TTN: Should not be able to insert data, device does not exist", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({
            end_device_ids: {
                dev_eui: "shjdgfliakjGDFHJSDF",
                device_id: "ASLDSKDJFHSDKJF",
            },
            uplink_message: {
                frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
                decoded_payload: {
                    battery: "4.58",
                    co2: "474.526",
                    humidity: "42.83",
                    temperature: "30.67",
                },
                settings: { time: new Date() },
            },
        })
            .expect(400);
    });
    it("TTN: Should be able to insert data, device does exist", async () => {
        const device = await device_service_1.DeviceService.createDevice("Device", "shjdgfliakjGDFHJSDFkzgiu", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                {
                    name: "battery",
                    sensorType: "battery",
                },
                {
                    name: "humidity",
                    sensorType: "humidity",
                },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({
            end_device_ids: {
                dev_eui: device.devEui,
                device_id: "ASLDSKDJFHSDKJF",
            },
            uplink_message: {
                frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
                decoded_payload: {
                    battery: "4.58",
                    co2: "474.526",
                    humidity: "42.83",
                    temperature: "30.67",
                },
                settings: { time: new Date() },
            },
        })
            .expect(200);
    });
    it("TTN: Should insert data with existing rssi sensor", async () => {
        const deviceWithRssi = await device_service_1.DeviceService.createDevice("Device with RSSI", "shjdgflasdiakjsGDFHJSDFlll", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                { name: "battery", sensorType: "battery" },
                { name: "humidity", sensorType: "humidity" },
                { name: "rssi", sensorType: "rssi" },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({
            end_device_ids: {
                dev_eui: deviceWithRssi.devEui,
                device_id: "ASLDSKDJFHSDKJF",
            },
            uplink_message: {
                frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
                decoded_payload: { battery: "4.58", humidity: "42.83" },
                settings: { time: new Date() },
                rx_metadata: [{ rssi: -85 }],
            },
        })
            .expect(200);
    });
    it("TTN: Should create rssi sensor if not exists, but type does", async () => {
        const deviceWithRssi = await device_service_1.DeviceService.createDevice("Device with RSSI", "shjdgfliaasdkasjsGDFHJSDFdddd", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                { name: "battery", sensorType: "battery" },
                { name: "humidity", sensorType: "humidity" },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({
            end_device_ids: {
                dev_eui: deviceWithRssi.devEui,
                device_id: "ASLDSKDJFHSDKJF",
            },
            uplink_message: {
                frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
                decoded_payload: { battery: "4.58", humidity: "42.83" },
                settings: { time: new Date() },
                rx_metadata: [{ rssi: -85 }],
            },
        })
            .expect(200);
    });
    it("TTN: Should not insert data if data with identical timestamp already exists for device", async () => {
        const timestamp = new Date();
        const device = await device_service_1.DeviceService.createDevice("Device", "shjdsgflia6kjGDFHJSDFkziutf", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                {
                    name: "battery",
                    sensorType: "battery",
                },
                {
                    name: "humidity",
                    sensorType: "humidity",
                },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({
            end_device_ids: {
                dev_eui: device.devEui,
                device_id: "ASLDSKDJFHSDKJF",
            },
            uplink_message: {
                frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
                decoded_payload: {
                    battery: "4.58",
                    humidity: "42.83",
                },
                settings: { time: timestamp },
            },
        })
            .expect(200);
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/ttn")
            .set("api-key", datasource.token)
            .send({
            end_device_ids: {
                dev_eui: device.devEui,
                device_id: "ASLDSKDJFHSDKJF",
            },
            uplink_message: {
                frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
                decoded_payload: {
                    battery: "4.58",
                    humidity: "42.83",
                },
                settings: { time: timestamp },
            },
        })
            .expect(400);
    });
    it("Chirpstack: No api Key was provided, should not be able to access", async () => {
        await (0, supertest_1.default)(server_1.default.express).post("/v1/data/chirp").expect(401);
    });
    it("Chirpstack: Wrong api Key was provided, should not be able to access", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp")
            .set("api-key", "aljshdljhgkjghlkhlhgkhjkjashdkjlas")
            .expect(401);
    });
    it("Chirpstack: Should not be able to access if validation failed", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({})
            .expect(422);
    });
    it("Chirpstack: Should not be able to insert data, device does not exist", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({
            time: new Date(),
            deviceInfo: {
                deviceName: "Device",
                devEui: "shjdsgflia6kjG676tJSDFnotexist",
            },
            object: {
                battery: "4.58",
                co2: "474.526",
                humidity: "42.83",
                temperature: "30.67",
            },
        })
            .expect(400);
    });
    it("Chirpstack: Should be able to insert data, device does exist", async () => {
        const device = await device_service_1.DeviceService.createDevice("Device", "shjdsgflia6kjGDFHJSDFfdziuhiu", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                {
                    name: "battery",
                    sensorType: "battery",
                },
                {
                    name: "humidity",
                    sensorType: "humidity",
                },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({
            time: new Date(),
            deviceInfo: {
                deviceName: device.name,
                devEui: device.devEui,
            },
            object: {
                battery: "4.58",
                humidity: "42.83",
            },
        })
            .expect(200);
    });
    it("Chirpstack: Should insert data with existing rssi sensor", async () => {
        const deviceWithRssi = await device_service_1.DeviceService.createDevice("Device with RSSI", "shjdgflasdiakjsGDFHJSDFrteszrz", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                { name: "battery", sensorType: "battery" },
                { name: "humidity", sensorType: "humidity" },
                { name: "rssi", sensorType: "rssi" },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({
            time: new Date(),
            deviceInfo: {
                deviceName: deviceWithRssi.name,
                devEui: deviceWithRssi.devEui,
            },
            object: {
                battery: "4.58",
                humidity: "42.83",
            },
            rxInfo: [
                {
                    rssi: -85,
                },
            ],
        })
            .expect(200);
    });
    it("Chirpstack: Should create rssi sensor if not exists, but type does", async () => {
        const deviceWithRssi = await device_service_1.DeviceService.createDevice("Device with RSSI", "shjdgfliaasdkasjsGDihfdfd", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                { name: "battery", sensorType: "battery" },
                { name: "humidity", sensorType: "humidity" },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({
            time: new Date(),
            deviceInfo: {
                deviceName: deviceWithRssi.name,
                devEui: deviceWithRssi.devEui,
            },
            object: {
                battery: "4.58",
                humidity: "42.83",
            },
            rxInfo: [
                {
                    rssi: -85,
                },
            ],
        })
            .expect(200);
    });
    it("Chirpstack: Should not insert data if data with identical timestamp already exists for device", async () => {
        const timestamp = new Date();
        const device = await device_service_1.DeviceService.createDevice("Device", "shjdsgflia6kjGDFHJSDF", "devicetype", enums_1.DeviceStatus.development, place.id, {
            sensors: [
                {
                    name: "battery",
                    sensorType: "battery",
                },
                {
                    name: "humidity",
                    sensorType: "humidity",
                },
            ],
        });
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({
            time: timestamp,
            deviceInfo: {
                deviceName: device.name,
                devEui: device.devEui,
            },
            object: {
                battery: "4.58",
                humidity: "42.83",
            },
        })
            .expect(200);
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=up")
            .set("api-key", datasource.token)
            .send({
            time: timestamp,
            deviceInfo: {
                deviceName: device.name,
                devEui: device.devEui,
            },
            object: {
                battery: "4.58",
                humidity: "42.83",
            },
        })
            .expect(400);
    });
    it("Chirpstack: Should return 200 for status event (different than up)", async () => {
        await (0, supertest_1.default)(server_1.default.express)
            .post("/v1/data/chirp?event=join")
            .set("api-key", datasource.token)
            .send({})
            .expect(200);
    });
});
