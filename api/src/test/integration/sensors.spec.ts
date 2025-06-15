import "reflect-metadata";

import Device from "@schemas/device.schema";
import Sensor from "@schemas/sensor.schema";
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { SensorService } from "@services/sensor.service";
import { DeviceStatus, Permission } from "@utils/enums";
import { expect } from "chai";
import { describe } from "mocha";
import { ITestUser, createTestUsers } from "./helper/db.helper";
import {
  expectData,
  expectForbidden,
  expectNotFoundRequest,
} from "./helper/expect.helper";
import { gRequestSuccess, initTest } from "./helper/server.helper";

describe("Test sensor", () => {
  let testUser: ITestUser;

  before(async () => {
    await initTest();
    testUser = await createTestUsers();
  });

  describe("Test createSensor", () => {
    let createSensorQuery: string;
    let device: Device;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace", undefined, {
        users: [
          { userId: testUser.moderator2.user.id, permission: Permission.write },
        ],
      });

      device = await DeviceService.createDevice(
        "TestDevice",
        "askdjasd",
        "type",
        DeviceStatus.development,
        place.id,
      );

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
      const response = await gRequestSuccess(createSensorQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        createSensorQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined, when no access to place", async () => {
      const response = await gRequestSuccess(
        createSensorQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined, when permission read to place", async () => {
      const response = await gRequestSuccess(
        createSensorQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Admin user should be able to create sensor", async () => {
      const response = await gRequestSuccess(createSensorQuery, testUser.admin);

      expectData(response, {
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

      const response = await gRequestSuccess(
        createSensorModeratorQuery,
        testUser.moderator2,
      );

      expectData(response, {
        createSensor: {
          name: "TestSensor2",
        },
      });
    });
  });

  describe("Test updateSensor", () => {
    let sensor: Sensor;
    let device: Device;
    let updateSensorQuery: string;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace6", undefined, {
        users: [
          { userId: testUser.moderator.user.id, permission: Permission.admin },
        ],
      });

      device = await DeviceService.createDevice(
        "Testdevice2",
        "123456",
        "type2",
        DeviceStatus.development,
        place.id,
      );

      sensor = await SensorService.createSensor(
        "Testsensor",
        "temperature",
        device.id,
        {
          alias: "alias",
        },
      );

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
      const response = await gRequestSuccess(updateSensorQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        updateSensorQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined, when no access to place", async () => {
      const response = await gRequestSuccess(
        updateSensorQuery,
        testUser.moderator2,
      );
      expectForbidden(response);
    });

    it("Admin user should be able to update device", async () => {
      const response = await gRequestSuccess(updateSensorQuery, testUser.admin);

      expectData(response, {
        updateSensor: {
          name: "Tests",
          sensorType: "humidity",
          alias: "test",
        },
      })["updateDevice"];
    });
  });

  describe("Test getSensor", () => {
    let getSensorQuery: string;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace34");

      const device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjasdfslkd",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
      );

      const sensor = await SensorService.createSensor(
        "testSensor",
        "temp",
        device.id,
      );

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
      const response = await gRequestSuccess(getSensorQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(getSensorQuery, testUser.default);
      expectForbidden(response);
    });

    it("Sensor does not exist", async () => {
      const response = await gRequestSuccess(
        `query Query {
                        sensor(id: 12343){id}
                      }`,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    it("Admin user should be able to get sensor", async () => {
      const response = await gRequestSuccess(getSensorQuery, testUser.admin);

      expectData(response, {
        sensor: {
          name: "testSensor",
          sensorType: "temp",
          alias: null,
        },
      });
    });
  });

  describe("Test getSensors", () => {
    let getSensorsQuery: string;

    before(async () => {
      await Promise.all(
        (
          await DeviceService.getDevices({ userId: testUser.moderator.user.id })
        ).map((d) => DeviceService.deleteDevice(d.id)),
      );

      const place = await PlaceService.createPlace("Testplace56", undefined, {
        users: [
          { userId: testUser.default.user.id, permission: Permission.read },
        ],
      });

      const device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjasdfsasdlkd",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
      );

      await SensorService.createSensor("Test", "test", device.id);

      await SensorService.createSensor("Test2", "test", device.id);

      getSensorsQuery = `query Query {
                        sensors {
                          id
                        }
                      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getSensorsQuery);
      expectForbidden(response);
    });

    it("Default user should not be declined", async () => {
      const response = await gRequestSuccess(
        getSensorsQuery,
        testUser.moderator,
      );
      expect(response.body.data.sensors).to.be.empty;
    });

    it("Default user should be able to get sensors", async () => {
      const response = await gRequestSuccess(getSensorsQuery, testUser.default);
      expect(response.body.data.sensors.length).to.be.greaterThanOrEqual(2);
    });
  });

  describe("Test deleteSensor", () => {
    let sensorId: number;
    let deleteSensorQuery: string;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace89");

      const device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjaslkd",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
        { sensors: [{ sensorType: "asd", name: "asdasd" }] },
      );

      sensorId = (await SensorService.createSensor("test", "test", device.id))
        .id;

      deleteSensorQuery = `mutation Mutation {
                      deleteSensor(id: ${sensorId})
                    }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteSensorQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteSensorQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Device does not exist", async () => {
      const response = await gRequestSuccess(
        `mutation Mutation {
                      deleteSensor(id: 12343)
                    }`,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    it("Admin user should be allowed to delete device", async () => {
      const response = await gRequestSuccess(deleteSensorQuery, testUser.admin);

      expectData(response, {
        deleteSensor: true,
      });
    });
  });
});
