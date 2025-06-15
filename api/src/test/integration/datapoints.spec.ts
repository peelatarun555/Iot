import "reflect-metadata";

import { Datapoint } from "@schemas/datapoint.schema";
import Device from "@schemas/device.schema";
import Place from "@schemas/place.schema";
import { DatapointService } from "@services/datapoint.service";
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { DeviceStatus, Permission } from "@utils/enums";
import { expect } from "chai";
import { describe } from "mocha";
import { ITestUser, createTestUsers } from "./helper/db.helper";
import {
  expectBadRequest,
  expectData,
  expectForbidden,
  expectNotFoundRequest,
} from "./helper/expect.helper";
import { gRequestSuccess, initTest } from "./helper/server.helper";

describe("Test datapoints", () => {
  let testUser: ITestUser;
  let place: Place;

  before(async () => {
    await initTest();
    testUser = await createTestUsers();
    place = await PlaceService.createPlace("Testplace", undefined, {
      users: [
        { userId: testUser.moderator2.user.id, permission: Permission.admin },
        { userId: testUser.default.user.id, permission: Permission.read },
      ],
    });
  });

  describe("Test createDatapoint", () => {
    let createDatapointQuery: string;
    let device: Device;
    const currentTime = new Date();

    before(async () => {
      device = await DeviceService.createDevice(
        "test",
        "testasd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      createDatapointQuery = `mutation Mutation {
        createDatapoint(timestamp: "${currentTime.toISOString()}", value: 10, sensorId: ${
        device.sensors[0].id
      }) {
          value
        }
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(createDatapointQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        createDatapointQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        createDatapointQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to create new datapoint", async () => {
      const response = await gRequestSuccess(
        createDatapointQuery,
        testUser.admin,
      );
      expectData(response, {
        createDatapoint: {
          value: 10,
        },
      });
    });

    it("Can not create datapoint, when time and sensor aleady exists", async () => {
      const response = await gRequestSuccess(
        createDatapointQuery,
        testUser.admin,
      );
      expectBadRequest(response);
    });

    it("Moderator user should be allowed to create new datapoint when has permissions to device", async () => {
      const createDatapointModeratorQuery = `mutation Mutation {
            createDatapoint(timestamp: "${new Date().toISOString()}", value: 12, sensorId: ${
        device.sensors[0].id
      }) {
              value
            }
          }`;

      const response = await gRequestSuccess(
        createDatapointModeratorQuery,
        testUser.moderator2,
      );
      expectData(response, {
        createDatapoint: {
          value: 12,
        },
      });
    });
  });

  describe("Test updateDatapoint", () => {
    let datapoint: Datapoint;
    let updateDatapointQuery: string;

    before(async () => {
      const device = await DeviceService.createDevice(
        "test",
        "testasasd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      datapoint = await DatapointService.createDatapoint(
        new Date(),
        device.sensors[0].id,
        10,
        "asd",
      );

      updateDatapointQuery = `mutation Mutation {
          updateDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", value: 10, valueString: "test", sensorId: ${
        datapoint.sensorId
      }) {
            value,
            valueString
          }
        }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(updateDatapointQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        updateDatapointQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        updateDatapointQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to update datapoint", async () => {
      const response = await gRequestSuccess(
        updateDatapointQuery,
        testUser.admin,
      );

      expectData(response, {
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
      const response = await gRequestSuccess(
        updateDatapointQuery,
        testUser.admin,
      );
      expectNotFoundRequest(response);
    });

    it("Moderator user should be allowed to update datapoint", async () => {
      const response = await gRequestSuccess(
        updateDatapointQuery,
        testUser.moderator2,
      );

      expectData(response, {
        updateDatapoint: {
          value: 10,
          valueString: "test",
        },
      });
    });
  });

  describe("Test getDatapoint", () => {
    let datapoint: Datapoint;
    let getDatapointQuery: string;

    before(async () => {
      const device = await DeviceService.createDevice(
        "test",
        "testasassd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      datapoint = await DatapointService.createDatapoint(
        new Date(),
        device.sensors[0].id,
        10,
        "asd",
      );

      getDatapointQuery = `query Query  {
            datapoint (timestamp: "${datapoint.timestamp.toISOString()}", sensorId: ${
        datapoint.sensorId
      } ){
              timestamp,
              value,
              valueString
            }
          }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getDatapointQuery);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        getDatapointQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to get datapoint", async () => {
      const response = await gRequestSuccess(getDatapointQuery, testUser.admin);

      const data = expectData(response, {
        datapoint: {
          value: datapoint.value,
          valueString: datapoint.valueString,
        },
      })["datapoint"];

      expect(new Date(data.timestamp).toISOString()).to.equal(
        datapoint.timestamp.toISOString(),
      );
    });

    it("Default user should be allowed to get datapoint", async () => {
      const response = await gRequestSuccess(
        getDatapointQuery,
        testUser.default,
      );

      const data = expectData(response, {
        datapoint: {
          value: datapoint.value,
          valueString: datapoint.valueString,
        },
      })["datapoint"];

      expect(new Date(data.timestamp).toISOString()).to.equal(
        datapoint.timestamp.toISOString(),
      );
    });
  });

  describe("Test getDatapoints", () => {
    let datapoint: Datapoint;
    let getDatapointsQuery: string;

    before(async () => {
      const device = await DeviceService.createDevice(
        "test",
        "testasasassd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      datapoint = await DatapointService.createDatapoint(
        new Date(),
        device.sensors[0].id,
        10,
        "asd",
      );

      getDatapointsQuery = `query Query  {
            datapoints (sensorId: ${datapoint.sensorId} ){
              timestamp,
              value,
              valueString
            }
          }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getDatapointsQuery);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        getDatapointsQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to get datapoints", async () => {
      const response = await gRequestSuccess(
        getDatapointsQuery,
        testUser.admin,
      );

      expect(response.body.data.datapoints).to.have.length(1);
    });

    it("Default user should be allowed to get datapoints", async () => {
      const response = await gRequestSuccess(
        getDatapointsQuery,
        testUser.default,
      );

      expect(response.body.data.datapoints).to.have.length(1);
    });
  });

  describe("Test deleteDatapoint", () => {
    let deleteDatapointQuery: string;
    let datapoint: Datapoint;

    before(async () => {
      await Datapoint.clear();

      const device = await DeviceService.createDevice(
        "test",
        "testasdasasassd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      datapoint = await DatapointService.createDatapoint(
        new Date(),
        device.sensors[0].id,
        10,
        "asd",
      );

      deleteDatapointQuery = `mutation Mutation {
          deleteDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", sensorId: ${
        datapoint.sensorId
      } )
        }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteDatapointQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Should not be able to delete not existing datapoint", async () => {
      const deleteDatapointNotExistQuery = `mutation Mutation {
        deleteDatapoint(timestamp: "${datapoint.timestamp.toISOString()}", sensorId: 123123)
            }`;

      const response = await gRequestSuccess(
        deleteDatapointNotExistQuery,
        testUser.moderator2,
      );
      expectNotFoundRequest(response);
    });

    it("Moderator user2 should be allowed to delete datapoint", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.moderator2,
      );

      expectData(response, { deleteDatapoint: true });
    });
  });

  describe("Test deleteAllDatapointsOfSensor", () => {
    let deleteDatapointQuery: string;
    let datapoint: Datapoint;

    before(async () => {
      await Datapoint.clear();

      const device = await DeviceService.createDevice(
        "test",
        "testa8asasassd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      datapoint = await DatapointService.createDatapoint(
        new Date(),
        device.sensors[0].id,
        10,
        "asd",
      );

      await DatapointService.createDatapoint(
        new Date(),
        device.sensors[0].id,
        11,
        "asd",
      );

      deleteDatapointQuery = `mutation Mutation {
        deleteAllDatapointsOfSensor(sensorId: ${datapoint.sensorId} )
        }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteDatapointQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Should not be able to delete not existing datapoint", async () => {
      const deleteDatapointNotExistQuery = `mutation Mutation {
        deleteAllDatapointsOfSensor(sensorId: 123123 )
            }`;

      const response = await gRequestSuccess(
        deleteDatapointNotExistQuery,
        testUser.moderator2,
      );
      expectNotFoundRequest(response);
    });

    it("Moderator user2 should be allowed to delete all datapoint from sensor", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.moderator2,
      );

      expect(await Datapoint.find()).to.be.empty;

      expectData(response, { deleteAllDatapointsOfSensor: true });
    });
  });

  describe("Test deleteDatapointsTime", () => {
    let deleteDatapointQuery: string;
    let datapoint: Datapoint;

    before(async () => {
      await Datapoint.clear();

      const device = await DeviceService.createDevice(
        "test",
        "testa8asas7ssd",
        "test",
        DeviceStatus.production,
        place.id,
        {
          sensors: [
            {
              sensorType: "temperatutere",
              name: "temperatutere",
            },
          ],
        },
      );

      datapoint = await DatapointService.createDatapoint(
        new Date("2023-08-08"),
        device.sensors[0].id,
        10,
        "asd",
      );

      await DatapointService.createDatapoint(
        new Date("2023-08-10"),
        device.sensors[0].id,
        10,
        "asd",
      );

      deleteDatapointQuery = `mutation Mutation {
        deleteDatapointsTime(sensorId: ${
        datapoint.sensorId
      }, timestampFrom: "${new Date(
        "2023-08-07",
      ).toISOString()}",timestampTo: "${new Date(
        "2023-08-09",
      ).toISOString()}")
        }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteDatapointQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Moderator user2 should be allowed to delete all datapoint from sensor", async () => {
      const response = await gRequestSuccess(
        deleteDatapointQuery,
        testUser.moderator2,
      );

      expect(await Datapoint.find()).to.have.length(1);
      expectData(response, { deleteDatapointsTime: 1 });
    });
  });
});
