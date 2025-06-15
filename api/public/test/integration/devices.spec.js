"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const enums_1 = require("@utils/enums");
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const mocha_1 = require("mocha");
const db_helper_1 = require("./helper/db.helper");
const expect_helper_1 = require("./helper/expect.helper");
const server_helper_1 = require("./helper/server.helper");
chai_1.default.use(chai_as_promised_1.default);
const expect = chai_1.default.expect;
(0, mocha_1.describe)("Test device", () => {
    let testUser;
    before(async () => {
        await (0, server_helper_1.initTest)();
        testUser = await (0, db_helper_1.createTestUsers)();
    });
    (0, mocha_1.describe)("Test createDevice", () => {
        const currentTime = new Date();
        const createDeviceQuery = `mutation Mutation {
                    createDevice(name: "Testdevice", deviceType: "TestDeviceType", devEui: "1234", status: ${enums_1.DeviceStatus.development}, placeId: 1, options: {createdAt: "${currentTime.toISOString()}", sensors: [{alias: "temp1", name: "temperature1", sensorType: "temperature" }]}) {
                      id,
                      name,
                      deviceType,
                      devEui,
                      description,
                      status,
                      createdAt
                    }
                  }`;
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDeviceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDeviceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined, when no access to place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDeviceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined, when permission read to place", async () => {
            await place_service_1.default.createPlace("TestPlace", undefined, {
                users: [
                    { userId: testUser.moderator.user.id, permission: enums_1.Permission.read },
                ],
            });
            const response = await (0, server_helper_1.gRequestSuccess)(createDeviceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be able to create device", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDeviceQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                createDevice: {
                    name: "Testdevice",
                    deviceType: "TestDeviceType",
                    devEui: "1234",
                    status: enums_1.DeviceStatus.development,
                },
            });
        });
        it("Moderator user should be able to create device", async () => {
            await place_service_1.default.createPlace("TestPlace2", undefined, {
                users: [
                    { userId: testUser.moderator.user.id, permission: enums_1.Permission.write },
                ],
            });
            const createDeviceQueryModerator = `mutation Mutation {
        createDevice(name: "Testdevice", deviceType: "TestDeviceType", devEui: "12345", status: ${enums_1.DeviceStatus.development}, placeId: 2, options: {createdAt: "${currentTime.toISOString()}", sensors: [{alias: "temp1", name: "temperature1", sensorType: "temperature" }]}) {
          id,
          name,
          deviceType,
          devEui,
          description,
          status,
          createdAt
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(createDeviceQueryModerator, testUser.moderator);
            (0, expect_helper_1.expectData)(response, {
                createDevice: {
                    name: "Testdevice",
                    deviceType: "TestDeviceType",
                    devEui: "12345",
                    status: enums_1.DeviceStatus.development,
                },
            });
        });
    });
    (0, mocha_1.describe)("Test updateDevice", () => {
        let device;
        let updateDeviceQuery;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace3", undefined, {
                users: [
                    { userId: testUser.moderator.user.id, permission: enums_1.Permission.admin },
                ],
            });
            device = await device_service_1.DeviceService.createDevice("Testdevice2", "123456", "type2", enums_1.DeviceStatus.development, place.id);
            updateDeviceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {name: "Testdevice", deviceType: "TestDeviceType", devEui: "1234567", status: ${enums_1.DeviceStatus.development}}) {
           id,
           name,
           deviceType,
           devEui,
           description,
           status,
           createdAt,
           sensors {id}
         }
       }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDeviceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDeviceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined, when no access to place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDeviceQuery, testUser.moderator2);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be able to update device", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDeviceQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                updateDevice: {
                    name: "Testdevice",
                    deviceType: "TestDeviceType",
                    devEui: "1234567",
                    status: enums_1.DeviceStatus.development,
                },
            })["updateDevice"];
            expect(data.sensors).to.be.empty;
        });
        it("Moderator user should be able to update device", async () => {
            const updateDevicModeratoreQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {name: "Testdevice", deviceType: "TestDeviceType", devEui: "12345678", status: ${enums_1.DeviceStatus.development}}) {
           id,
           name,
           deviceType,
           devEui,
           description,
           status,
           createdAt,
           sensors {id}
         }
       }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateDevicModeratoreQuery, testUser.moderator);
            const data = (0, expect_helper_1.expectData)(response, {
                updateDevice: {
                    name: "Testdevice",
                    deviceType: "TestDeviceType",
                    devEui: "12345678",
                    status: enums_1.DeviceStatus.development,
                },
            })["updateDevice"];
            expect(data.sensors).to.be.empty;
        });
        it("Admin user should be able to update place from device", async () => {
            const place = await place_service_1.default.createPlace("test");
            const updateDevicePlaceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {placeId: ${place.id}}) {
           id,
           place {id}
         }
       }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateDevicePlaceQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                updateDevice: { place: { id: place.id } },
            })["updateDevice"];
        });
        it("Moderator user should be declined to update place from device, if permissions are not write on both places", async () => {
            const place = await place_service_1.default.createPlace("test2");
            const updateDevicePlaceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {placeId: ${place.id}}) {
           id,
           place {id}
         }
       }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateDevicePlaceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be able to update place from device, if permissions are write on both places", async () => {
            const placeFrom = await place_service_1.default.createPlace("Testplaceadas4", undefined, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                ],
            });
            const place = await place_service_1.default.createPlace("test564567", testUser.moderator.user.id, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.write,
                    },
                ],
            });
            await device_service_1.DeviceService.updateDevice(device.id, undefined, {
                placeId: placeFrom.id,
            });
            const updateDevicePlaceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {placeId: ${place.id}}) {
           id,
           place {id}
         }
       }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateDevicePlaceQuery, testUser.moderator);
            (0, expect_helper_1.expectData)(response, {
                updateDevice: { place: { id: place.id } },
            })["updateDevice"];
        });
    });
    (0, mocha_1.describe)("Test getDevice", () => {
        let device;
        let getDeviceQuery;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace5");
            device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjasdfslkd", "aösldkasd", enums_1.DeviceStatus.development, place.id);
            getDeviceQuery = `query Query {
        device(id: ${device.id}) {
          id,
          name,
          deviceType,
          devEui,
          description,
          status,
          createdAt,
          place {id},
          sensors {id}
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDeviceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDeviceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Device does not exist", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(`query Query {
        device(id: 12343){id}
      }`, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be able to get device", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDeviceQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                device: {
                    name: "DeleteDevice",
                    description: null,
                    devEui: "ASLDJASDFSLKD",
                    status: enums_1.DeviceStatus.development,
                    deviceType: "aösldkasd",
                },
            })["device"];
            expect(data.place.id).to.be.greaterThanOrEqual(0);
            expect(data.sensors).to.be.empty;
        });
    });
    (0, mocha_1.describe)("Test getDevices", () => {
        let getDevicesQuery;
        let device;
        before(async () => {
            const place = await place_service_1.default.createPlace("Testplace6", undefined, {
                users: [
                    { userId: testUser.default.user.id, permission: enums_1.Permission.read },
                ],
            });
            device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjasdfsasdlkd", "aösldkasd", enums_1.DeviceStatus.development, place.id);
            await device_service_1.DeviceService.createDevice("DeleteDevice2", "asldjasdfqweslk2d", "aösldkasd", enums_1.DeviceStatus.development, place.id);
            getDevicesQuery = `query Query {
        devices {
          id
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDevicesQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should not be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDevicesQuery, testUser.moderator2);
            expect(response.body.data.devices).to.be.empty;
        });
        it("Default user should be able to get devices", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDevicesQuery, testUser.default);
            expect(response.body.data.devices).to.have.length(2);
        });
        it("Admin user should be able to get deleted devices", async () => {
            await device_service_1.DeviceService.softDeleteDevice(device.id);
            const response = await (0, server_helper_1.gRequestSuccess)(`query Query {
        devices (options: {deleted: true}){
          id
        }
      }`, testUser.admin);
            expect(response.body.data.devices).to.have.length(1);
        });
    });
    (0, mocha_1.describe)("Test deleteDevice", () => {
        let device;
        let deleteDeviceQuery;
        let place;
        before(async () => {
            place = await place_service_1.default.createPlace("Testplace7");
            device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjaslkd", "aösldkasd", enums_1.DeviceStatus.development, place.id, { sensors: [{ sensorType: "asd", name: "asdasd" }] });
            deleteDeviceQuery = `mutation Mutation {
        deleteDevice(id: ${device.id})
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDeviceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDeviceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Device does not exist", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(`mutation Mutation {
        deleteDevice(id: 12343)
      }`, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
    });
    (0, mocha_1.describe)("Test undoDeleteDevice", () => {
        let device;
        let deleteDeviceQuery;
        let place;
        before(async () => {
            place = await place_service_1.default.createPlace("Testplace8");
            device = await device_service_1.DeviceService.createDevice("DeleteDevice", "asldjasslkd", "aösldkaasd", enums_1.DeviceStatus.development, place.id, { sensors: [{ sensorType: "asd", name: "asdasd" }] });
            await device_service_1.DeviceService.softDeleteDevice(device.id);
            deleteDeviceQuery = `mutation Mutation {
        undoDeleteDevice(id: ${device.id}){
          name,
          place {
            name
          }
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDeviceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDeviceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Device does not exist", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(`mutation Mutation {
          undoDeleteDevice(id: 12343){id}
      }`, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be allowed to undo soft delete", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDeviceQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                undoDeleteDevice: {
                    name: "DeleteDevice",
                    place: { name: "Testplace8" },
                },
            });
            expect(await device_service_1.DeviceService.getDevice(device.id)).to.be.not.undefined;
        });
    });
});
