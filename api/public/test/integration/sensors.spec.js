"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const sensor_service_1 = require("@services/sensor.service");
const enums_1 = require("@utils/enums");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const db_helper_1 = require("./helper/db.helper");
const expect_helper_1 = require("./helper/expect.helper");
const server_helper_1 = require("./helper/server.helper");
(0, mocha_1.describe)("Test sensor", () => {
    let testUser;
    before(async () => {
        await (0, server_helper_1.initTest)();
        testUser = await (0, db_helper_1.createTestUsers)();
    });
    (0, mocha_1.describe)("Test createSensor", () => {
        let createSensorQuery;
        let device;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace", undefined, {
                users: [
                    { userId: testUser.moderator2.user.id, permission: enums_1.Permission.write },
                ],
            });
            device = await device_service_1.DeviceService.createDevice("TestDevice", "askdjasd", "type", enums_1.DeviceStatus.development, place.id);
            createSensorQuery = `mutation Mutation {
        createSensor(name: "TestSensor", sensorType: "temperature", deviceId: ${device.id}, options: {alias: "Alias"}) {
          id,
          name,
          alias,
          sensorType,
          device {id}
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createSensorQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createSensorQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined, when no access to place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createSensorQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined, when permission read to place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createSensorQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be able to create sensor", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createSensorQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                createSensor: {
                    name: "TestSensor",
                    sensorType: "temperature",
                    alias: "Alias",
                    device: { id: device.id },
                },
            });
        });
        it("Moderator user with place permissions should be able to create sensor", async () => {
            const createSensorModeratorQuery = `mutation Mutation {
        createSensor(name: "TestSensor2", sensorType: "temperature", deviceId: ${device.id}, options: {alias: "Alias"}) {
          id,
          name,
          alias,
          sensorType,
          device {id}
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(createSensorModeratorQuery, testUser.moderator2);
            (0, expect_helper_1.expectData)(response, {
                createSensor: {
                    name: "TestSensor2",
                },
            });
        });
    });
    (0, mocha_1.describe)("Test updateSensor", () => {
        let sensor;
        let device;
        let updateSensorQuery;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace6", undefined, {
                users: [
                    { userId: testUser.moderator.user.id, permission: enums_1.Permission.admin },
                ],
            });
            device = await device_service_1.DeviceService.createDevice("Testdevice2", "123456", "type2", enums_1.DeviceStatus.development, place.id);
            sensor = await sensor_service_1.SensorService.createSensor("Testsensor", "temperature", device.id, {
                alias: "alias",
            });
            updateSensorQuery = `mutation Mutation {
                        updateSensor(id: ${sensor.id}, options: {name: "Tests", sensorType: "humidity", alias: "test"}) {
                           id,
                           name,
                           alias,
                           sensorType
                         }
                       }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateSensorQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateSensorQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined, when no access to place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateSensorQuery, testUser.moderator2);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be able to update device", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateSensorQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                updateSensor: {
                    name: "Tests",
                    sensorType: "humidity",
                    alias: "test",
                },
            })["updateDevice"];
        });
    });
    (0, mocha_1.describe)("Test getSensor", () => {
        let getSensorQuery;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace34");
            const device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjasdfslkd", "aösldkasd", enums_1.DeviceStatus.development, place.id);
            const sensor = await sensor_service_1.SensorService.createSensor("testSensor", "temp", device.id);
            getSensorQuery = `query Query {
        sensor(id: ${sensor.id}) {
                          id,
                          name,
                          sensorType, 
                          alias
                        }
                      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getSensorQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getSensorQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Sensor does not exist", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(`query Query {
                        sensor(id: 12343){id}
                      }`, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be able to get sensor", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getSensorQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                sensor: {
                    name: "testSensor",
                    sensorType: "temp",
                    alias: null,
                },
            });
        });
    });
    (0, mocha_1.describe)("Test getSensors", () => {
        let getSensorsQuery;
        before(async () => {
            await Promise.all((await device_service_1.DeviceService.getDevices({ userId: testUser.moderator.user.id })).map((d) => device_service_1.DeviceService.deleteDevice(d.id)));
            const place = await place_service_1.default.createPlace("Testplace56", undefined, {
                users: [
                    { userId: testUser.default.user.id, permission: enums_1.Permission.read },
                ],
            });
            const device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjasdfsasdlkd", "aösldkasd", enums_1.DeviceStatus.development, place.id);
            await sensor_service_1.SensorService.createSensor("Test", "test", device.id);
            await sensor_service_1.SensorService.createSensor("Test2", "test", device.id);
            getSensorsQuery = `query Query {
                        sensors {
                          id
                        }
                      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getSensorsQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should not be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getSensorsQuery, testUser.moderator);
            (0, chai_1.expect)(response.body.data.sensors).to.be.empty;
        });
        it("Default user should be able to get sensors", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getSensorsQuery, testUser.default);
            (0, chai_1.expect)(response.body.data.sensors.length).to.be.greaterThanOrEqual(2);
        });
    });
    (0, mocha_1.describe)("Test deleteSensor", () => {
        let sensorId;
        let deleteSensorQuery;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace89");
            const device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjaslkd", "aösldkasd", enums_1.DeviceStatus.development, place.id, { sensors: [{ sensorType: "asd", name: "asdasd" }] });
            sensorId = (await sensor_service_1.SensorService.createSensor("test", "test", device.id))
                .id;
            deleteSensorQuery = `mutation Mutation {
                      deleteSensor(id: ${sensorId})
                    }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteSensorQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteSensorQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Device does not exist", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(`mutation Mutation {
                      deleteSensor(id: 12343)
                    }`, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be allowed to delete device", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteSensorQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                deleteSensor: true,
            });
        });
    });
});
