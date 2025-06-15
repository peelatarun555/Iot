"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const datapoint_service_1 = require("@services/datapoint.service");
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const enums_1 = require("@utils/enums");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const db_helper_1 = require("./helper/db.helper");
const expect_helper_1 = require("./helper/expect.helper");
const server_helper_1 = require("./helper/server.helper");
(0, mocha_1.describe)("Test datapoints", () => {
    let testUser;
    let place;
    before(async () => {
        await (0, server_helper_1.initTest)();
        testUser = await (0, db_helper_1.createTestUsers)();
        place = await place_service_1.default.createPlace("Testplace", undefined, {
            users: [
                { userId: testUser.moderator2.user.id, permission: enums_1.Permission.admin },
                { userId: testUser.default.user.id, permission: enums_1.Permission.read },
            ],
        });
    });
    (0, mocha_1.describe)("Test createDatapoint", () => {
        let createDatapointQuery;
        let device;
        const currentTime = new Date();
        before(async () => {
            device = await device_service_1.DeviceService.createDevice("test", "testasd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            createDatapointQuery = `mutation Mutation {
        createDatapoint(timestamp: "${currentTime.toISOString()}", value: 10, sensorId: ${device.sensors[0].id}) {
          value
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatapointQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatapointQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatapointQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to create new datapoint", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatapointQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                createDatapoint: {
                    value: 10,
                },
            });
        });
        it("Can not create datapoint, when time and sensor aleady exists", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatapointQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
        });
        it("Moderator user should be allowed to create new datapoint when has permissions to device", async () => {
            const createDatapointModeratorQuery = `mutation Mutation {
            createDatapoint(timestamp: "${new Date().toISOString()}", value: 12, sensorId: ${device.sensors[0].id}) {
              value
            }
          }`;
            const response = await (0, server_helper_1.gRequestSuccess)(createDatapointModeratorQuery, testUser.moderator2);
            (0, expect_helper_1.expectData)(response, {
                createDatapoint: {
                    value: 12,
                },
            });
        });
    });
    (0, mocha_1.describe)("Test updateDatapoint", () => {
        let datapoint;
        let updateDatapointQuery;
        before(async () => {
            const device = await device_service_1.DeviceService.createDevice("test", "testasasd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            datapoint = await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 10, "asd");
            updateDatapointQuery = `mutation Mutation {
          updateDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", value: 10, valueString: "test", sensorId: ${datapoint.sensorId}) {
            value,
            valueString
          }
        }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatapointQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatapointQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatapointQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to update datapoint", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatapointQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                updateDatapoint: {
                    value: 10,
                    valueString: "test",
                },
            });
        });
        it("Can not update datapoint, when datapoint does not exist", async () => {
            const updateDatapointQuery = `mutation Mutation {
        updateDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", value: 10, valueString: "test", sensorId: 123) {
          value,
          valueString
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatapointQuery, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Moderator user should be allowed to update datapoint", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatapointQuery, testUser.moderator2);
            (0, expect_helper_1.expectData)(response, {
                updateDatapoint: {
                    value: 10,
                    valueString: "test",
                },
            });
        });
    });
    (0, mocha_1.describe)("Test getDatapoint", () => {
        let datapoint;
        let getDatapointQuery;
        before(async () => {
            const device = await device_service_1.DeviceService.createDevice("test", "testasassd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            datapoint = await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 10, "asd");
            getDatapointQuery = `query Query  {
            datapoint (timestamp: "${datapoint.timestamp.toISOString()}", sensorId: ${datapoint.sensorId} ){
              timestamp,
              value,
              valueString
            }
          }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to get datapoint", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                datapoint: {
                    value: datapoint.value,
                    valueString: datapoint.valueString,
                },
            })["datapoint"];
            (0, chai_1.expect)(new Date(data.timestamp).toISOString()).to.equal(datapoint.timestamp.toISOString());
        });
        it("Default user should be allowed to get datapoint", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointQuery, testUser.default);
            const data = (0, expect_helper_1.expectData)(response, {
                datapoint: {
                    value: datapoint.value,
                    valueString: datapoint.valueString,
                },
            })["datapoint"];
            (0, chai_1.expect)(new Date(data.timestamp).toISOString()).to.equal(datapoint.timestamp.toISOString());
        });
    });
    (0, mocha_1.describe)("Test getDatapoints", () => {
        let datapoint;
        let getDatapointsQuery;
        before(async () => {
            const device = await device_service_1.DeviceService.createDevice("test", "testasasassd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            datapoint = await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 10, "asd");
            getDatapointsQuery = `query Query  {
            datapoints (sensorId: ${datapoint.sensorId} ){
              timestamp,
              value,
              valueString
            }
          }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointsQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointsQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to get datapoints", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointsQuery, testUser.admin);
            (0, chai_1.expect)(response.body.data.datapoints).to.have.length(1);
        });
        it("Default user should be allowed to get datapoints", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatapointsQuery, testUser.default);
            (0, chai_1.expect)(response.body.data.datapoints).to.have.length(1);
        });
    });
    (0, mocha_1.describe)("Test deleteDatapoint", () => {
        let deleteDatapointQuery;
        let datapoint;
        before(async () => {
            await datapoint_schema_1.Datapoint.clear();
            const device = await device_service_1.DeviceService.createDevice("test", "testasdasasassd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            datapoint = await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 10, "asd");
            deleteDatapointQuery = `mutation Mutation {
          deleteDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", sensorId: ${datapoint.sensorId} )
        }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Should not be able to delete not existing datapoint", async () => {
            const deleteDatapointNotExistQuery = `mutation Mutation {
        deleteDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", sensorId: 123123)
            }`;
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointNotExistQuery, testUser.moderator2);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Moderator user2 should be allowed to delete datapoint", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.moderator2);
            (0, expect_helper_1.expectData)(response, { deleteDatapoint: true });
        });
    });
    (0, mocha_1.describe)("Test deleteAllDatapointsOfSensor", () => {
        let deleteDatapointQuery;
        let datapoint;
        before(async () => {
            await datapoint_schema_1.Datapoint.clear();
            const device = await device_service_1.DeviceService.createDevice("test", "testa8asasassd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            datapoint = await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 10, "asd");
            await datapoint_service_1.DatapointService.createDatapoint(new Date(), device.sensors[0].id, 11, "asd");
            deleteDatapointQuery = `mutation Mutation {
        deleteAllDatapointsOfSensor(sensorId: ${datapoint.sensorId} )
        }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Should not be able to delete not existing datapoint", async () => {
            const deleteDatapointNotExistQuery = `mutation Mutation {
        deleteAllDatapointsOfSensor(sensorId: 123123 )
            }`;
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointNotExistQuery, testUser.moderator2);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Moderator user2 should be allowed to delete all datapoint from sensor", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.moderator2);
            (0, chai_1.expect)(await datapoint_schema_1.Datapoint.find()).to.be.empty;
            (0, expect_helper_1.expectData)(response, { deleteAllDatapointsOfSensor: true });
        });
    });
    (0, mocha_1.describe)("Test deleteDatapointsTime", () => {
        let deleteDatapointQuery;
        let datapoint;
        before(async () => {
            await datapoint_schema_1.Datapoint.clear();
            const device = await device_service_1.DeviceService.createDevice("test", "testa8asas7ssd", "test", enums_1.DeviceStatus.production, place.id, {
                sensors: [
                    {
                        sensorType: "temperatutere",
                        name: "temperatutere",
                    },
                ],
            });
            datapoint = await datapoint_service_1.DatapointService.createDatapoint(new Date("2023-08-08"), device.sensors[0].id, 10, "asd");
            await datapoint_service_1.DatapointService.createDatapoint(new Date("2023-08-10"), device.sensors[0].id, 10, "asd");
            deleteDatapointQuery = `mutation Mutation {
        deleteDatapointsTime(sensorId: ${datapoint.sensorId}, timestampFrom: "${new Date("2023-08-07").toISOString()}",timestampTo: "${new Date("2023-08-09").toISOString()}")
        }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user2 should be allowed to delete all datapoint from sensor", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatapointQuery, testUser.moderator2);
            (0, chai_1.expect)(await datapoint_schema_1.Datapoint.find()).to.have.length(1);
            (0, expect_helper_1.expectData)(response, { deleteDatapointsTime: 1 });
        });
    });
});
