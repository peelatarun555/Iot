import "reflect-metadata";

import Device from "@schemas/device.schema";
import Place from "@schemas/place.schema";
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { DeviceStatus, Permission } from "@utils/enums";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { describe } from "mocha";
import { ITestUser, createTestUsers } from "./helper/db.helper";
import {
  expectData,
  expectForbidden,
  expectNotFoundRequest,
} from "./helper/expect.helper";
import { gRequestSuccess, initTest } from "./helper/server.helper";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Test device", () => {
  let testUser: ITestUser;

  before(async () => {
    await initTest();
    testUser = await createTestUsers();
  });

  describe("Test createDevice", () => {
    const currentTime = new Date();

    const createDeviceQuery = `mutation Mutation {
                    createDevice(name: "Testdevice", deviceType: "TestDeviceType", devEui: "1234", status: ${
      DeviceStatus.development
    }, placeId: 1, options: {createdAt: "${currentTime.toISOString()}", sensors: [{alias: "temp1", name: "temperature1", sensorType: "temperature" }]}) {
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
      const response = await gRequestSuccess(createDeviceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        createDeviceQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined, when no access to place", async () => {
      const response = await gRequestSuccess(
        createDeviceQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined, when permission read to place", async () => {
      await PlaceService.createPlace("TestPlace", undefined, {
        users: [
          { userId: testUser.moderator.user.id, permission: Permission.read },
        ],
      });

      const response = await gRequestSuccess(
        createDeviceQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Admin user should be able to create device", async () => {
      const response = await gRequestSuccess(createDeviceQuery, testUser.admin);

      expectData(response, {
        createDevice: {
          name: "Testdevice",
          deviceType: "TestDeviceType",
          devEui: "1234",
          status: DeviceStatus.development,
        },
      });
    });

    it("Moderator user should be able to create device", async () => {
      await PlaceService.createPlace("TestPlace2", undefined, {
        users: [
          { userId: testUser.moderator.user.id, permission: Permission.write },
        ],
      });

      const createDeviceQueryModerator = `mutation Mutation {
        createDevice(name: "Testdevice", deviceType: "TestDeviceType", devEui: "12345", status: ${
        DeviceStatus.development
      }, placeId: 2, options: {createdAt: "${currentTime.toISOString()}", sensors: [{alias: "temp1", name: "temperature1", sensorType: "temperature" }]}) {
          id,
          name,
          deviceType,
          devEui,
          description,
          status,
          createdAt
        }
      }`;

      const response = await gRequestSuccess(
        createDeviceQueryModerator,
        testUser.moderator,
      );

      expectData(response, {
        createDevice: {
          name: "Testdevice",
          deviceType: "TestDeviceType",
          devEui: "12345",
          status: DeviceStatus.development,
        },
      });
    });
  });

  describe("Test updateDevice", () => {
    let device: Device;
    let updateDeviceQuery: string;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace3", undefined, {
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

      updateDeviceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {name: "Testdevice", deviceType: "TestDeviceType", devEui: "1234567", status: ${DeviceStatus.development}}) {
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
      const response = await gRequestSuccess(updateDeviceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        updateDeviceQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined, when no access to place", async () => {
      const response = await gRequestSuccess(
        updateDeviceQuery,
        testUser.moderator2,
      );
      expectForbidden(response);
    });

    it("Admin user should be able to update device", async () => {
      const response = await gRequestSuccess(updateDeviceQuery, testUser.admin);

      const data = expectData(response, {
        updateDevice: {
          name: "Testdevice",
          deviceType: "TestDeviceType",
          devEui: "1234567",
          status: DeviceStatus.development,
        },
      })["updateDevice"];

      expect(data.sensors).to.be.empty;
    });

    it("Moderator user should be able to update device", async () => {
      const updateDevicModeratoreQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {name: "Testdevice", deviceType: "TestDeviceType", devEui: "12345678", status: ${DeviceStatus.development}}) {
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

      const response = await gRequestSuccess(
        updateDevicModeratoreQuery,
        testUser.moderator,
      );

      const data = expectData(response, {
        updateDevice: {
          name: "Testdevice",
          deviceType: "TestDeviceType",
          devEui: "12345678",
          status: DeviceStatus.development,
        },
      })["updateDevice"];

      expect(data.sensors).to.be.empty;
    });

    it("Admin user should be able to update place from device", async () => {
      const place = await PlaceService.createPlace("test");

      const updateDevicePlaceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {placeId: ${place.id}}) {
           id,
           place {id}
         }
       }`;

      const response = await gRequestSuccess(
        updateDevicePlaceQuery,
        testUser.admin,
      );

      expectData(response, {
        updateDevice: { place: { id: place.id } },
      })["updateDevice"];
    });

    it("Moderator user should be declined to update place from device, if permissions are not write on both places", async () => {
      const place = await PlaceService.createPlace("test2");

      const updateDevicePlaceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {placeId: ${place.id}}) {
           id,
           place {id}
         }
       }`;

      const response = await gRequestSuccess(
        updateDevicePlaceQuery,
        testUser.moderator,
      );

      expectForbidden(response);
    });

    it("Moderator user should be able to update place from device, if permissions are write on both places", async () => {
      const placeFrom = await PlaceService.createPlace(
        "Testplaceadas4",
        undefined,
        {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
          ],
        },
      );

      const place = await PlaceService.createPlace(
        "test564567",
        testUser.moderator.user.id,
        {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.write,
            },
          ],
        },
      );

      await DeviceService.updateDevice(device.id, undefined, {
        placeId: placeFrom.id,
      });

      const updateDevicePlaceQuery = `mutation Mutation {
        updateDevice(id: ${device.id}, options: {placeId: ${place.id}}) {
           id,
           place {id}
         }
       }`;

      const response = await gRequestSuccess(
        updateDevicePlaceQuery,
        testUser.moderator,
      );

      expectData(response, {
        updateDevice: { place: { id: place.id } },
      })["updateDevice"];
    });
  });

  describe("Test getDevice", () => {
    let device: Device;
    let getDeviceQuery: string;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace5");

      device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjasdfslkd",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
      );
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
      const response = await gRequestSuccess(getDeviceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(getDeviceQuery, testUser.default);
      expectForbidden(response);
    });

    it("Device does not exist", async () => {
      const response = await gRequestSuccess(
        `query Query {
        device(id: 12343){id}
      }`,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    it("Admin user should be able to get device", async () => {
      const response = await gRequestSuccess(getDeviceQuery, testUser.admin);

      const data = expectData(response, {
        device: {
          name: "DeleteDevice",
          description: null,
          devEui: "ASLDJASDFSLKD",
          status: DeviceStatus.development,
          deviceType: "aösldkasd",
        },
      })["device"];

      expect(data.place.id).to.be.greaterThanOrEqual(0);
      expect(data.sensors).to.be.empty;
    });
  });

  describe("Test getDevices", () => {
    let getDevicesQuery: string;
    let device: Device;

    before(async () => {
      const place = await PlaceService.createPlace("Testplace6", undefined, {
        users: [
          { userId: testUser.default.user.id, permission: Permission.read },
        ],
      });

      device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjasdfsasdlkd",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
      );

      await DeviceService.createDevice(
        "DeleteDevice2",
        "asldjasdfqweslk2d",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
      );

      getDevicesQuery = `query Query {
        devices {
          id
        }
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getDevicesQuery);
      expectForbidden(response);
    });

    it("Default user should not be declined", async () => {
      const response = await gRequestSuccess(
        getDevicesQuery,
        testUser.moderator2,
      );
      expect(response.body.data.devices).to.be.empty;
    });

    it("Default user should be able to get devices", async () => {
      const response = await gRequestSuccess(getDevicesQuery, testUser.default);
      expect(response.body.data.devices).to.have.length(2);
    });

    it("Admin user should be able to get deleted devices", async () => {
      await DeviceService.softDeleteDevice(device.id);

      const response = await gRequestSuccess(
        `query Query {
        devices (options: {deleted: true}){
          id
        }
      }`,
        testUser.admin,
      );

      expect(response.body.data.devices).to.have.length(1);
    });
  });

  describe("Test deleteDevice", () => {
    let device: Device;
    let deleteDeviceQuery: string;
    let place: Place;

    before(async () => {
      place = await PlaceService.createPlace("Testplace7");

      device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjaslkd",
        "aösldkasd",
        DeviceStatus.development,
        place.id,
        { sensors: [{ sensorType: "asd", name: "asdasd" }] },
      );

      deleteDeviceQuery = `mutation Mutation {
        deleteDevice(id: ${device.id})
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteDeviceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDeviceQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Device does not exist", async () => {
      const response = await gRequestSuccess(
        `mutation Mutation {
        deleteDevice(id: 12343)
      }`,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    // it("Admin user should be allowed to delete device", async () => {
    //   const response = await gRequestSuccess(deleteDeviceQuery, testUser.admin);

    //   expectData(response, {
    //     deleteDevice: true,
    //   });

    //   await expect(DeviceService.getDevice(device.id)).to.be.rejectedWith(
    //     NotFoundGraphException
    //   );

    //   const deviceDeleted = await Device.findOne({
    //     where: { id: device.id },
    //     relations: { place: true },
    //   });
    //   expect(deviceDeleted?.deletedAt).to.be.not.undefined;
    //   expect(deviceDeleted?.place.name).to.equal("DeletedDevices");

    //   await PlaceService.deletePlace(place.id);
    // });
  });

  describe("Test undoDeleteDevice", () => {
    let device: Device;
    let deleteDeviceQuery: string;
    let place: Place;

    before(async () => {
      place = await PlaceService.createPlace("Testplace8");

      device = await DeviceService.createDevice(
        "DeleteDevice",
        "asldjasslkd",
        "aösldkaasd",
        DeviceStatus.development,
        place.id,
        { sensors: [{ sensorType: "asd", name: "asdasd" }] },
      );

      await DeviceService.softDeleteDevice(device.id);

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
      const response = await gRequestSuccess(deleteDeviceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDeviceQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Device does not exist", async () => {
      const response = await gRequestSuccess(
        `mutation Mutation {
          undoDeleteDevice(id: 12343){id}
      }`,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    it("Admin user should be allowed to undo soft delete", async () => {
      const response = await gRequestSuccess(deleteDeviceQuery, testUser.admin);

      expectData(response, {
        undoDeleteDevice: {
          name: "DeleteDevice",
          place: { name: "Testplace8" },
        },
      });

      expect(await DeviceService.getDevice(device.id)).to.be.not.undefined;
    });
  });
});
