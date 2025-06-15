import "reflect-metadata";

import Device from "@schemas/device.schema";
import Place from "@schemas/place.schema";
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

describe("Test place", () => {
  let testUser: ITestUser;

  before(async () => {
    await initTest();
    testUser = await createTestUsers();
  });

  describe("Test createPlace", () => {
    const createPlaceQuery = `mutation Mutation {
                    createPlace(name: "TestPlace", options: {users: [{userId: 1, permission: ${Permission.read}}] }) {
                      id,
                      name,
                      parent {id},
                      users {id}
                    }
                  }`;

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(createPlaceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        createPlaceQuery.replaceAll("TestPlace", "TestPlace2"),
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to create new place", async () => {
      const response = await gRequestSuccess(
        createPlaceQuery.replaceAll("TestPlace", "TestPlace3"),
        testUser.admin,
      );

      const data = expectData(response, {
        createPlace: {
          name: "TestPlace3",
          parent: null,
        },
      })["createPlace"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.users).to.have.length(1);
    });

    it("Moderatur user should be allowed to create new place, but not get users", async () => {
      const response = await gRequestSuccess(
        createPlaceQuery.replaceAll("TestPlace", "TestPlace4"),
        testUser.moderator,
      );

      expectForbidden(response);
    });

    it("Moderatur user should be allowed to create new place with parent", async () => {
      const place = await PlaceService.createPlace(
        "testplace",
        testUser.moderator.user.id,
        {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
          ],
        },
      );

      const createPlaceWithParentQuery = `mutation Mutation {
        createPlace(name: "TestPlace7", options: {users: [{userId: 1, permission: ${Permission.write}}], parentId: ${place.id} }) {
          id,
          name,
          parent {name}
        }
      }`;

      const response = await gRequestSuccess(
        createPlaceWithParentQuery,
        testUser.moderator,
      );

      const data = expectData(response, {
        createPlace: {
          name: "TestPlace7",
          parent: { name: "testplace" },
        },
      })["createPlace"];

      expect(data.id).to.be.greaterThanOrEqual(1);
      expect(data.users).to.be.undefined;
    });
  });

  describe("Test updatePlace", () => {
    let placeId: number;
    let parentPlaceId: number;

    let updatePlaceQuery: string;

    before(async () => {
      placeId = (
        await PlaceService.createPlace("CreatePlace", undefined, {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
          ],
        })
      ).id;

      parentPlaceId = (
        await PlaceService.createPlace("CreatePlaceParent", undefined, {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
          ],
        })
      ).id;

      updatePlaceQuery = `mutation Mutation {
        updatePlace(id: ${placeId}, options: {users: [{userId: ${testUser.moderator2.user.id}, permission: ${Permission.read}}], name: "testplace", parentId: ${parentPlaceId} }) {
          id,
          name,
          parent {id},
          users {id}
        }
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(updatePlaceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        updatePlaceQuery.replaceAll("testplace", "testplace2"),
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Should not be able to update not existing place", async () => {
      const updatePlaceNotExistQuery = `mutation Mutation {
        updatePlace(id: 122, options: {users: [{userId: ${testUser.moderator2.user.id}, permission: ${Permission.read}}], name: "testplace", parentId: ${parentPlaceId} }) {
          id,
          name,
          parent {id},
          users {id}
        }
      }`;

      const response = await gRequestSuccess(
        updatePlaceNotExistQuery,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    it("Should not be able to update place with not existing user", async () => {
      const updatePlaceNotExistQuery = `mutation Mutation {
        updatePlace(id: ${placeId}, options: {users: [{userId: 123, permission: ${Permission.read}}], name: "testplace", parentId: ${parentPlaceId} }) {
          id,
          name,
          parent {id},
          users {id}
        }
      }`;

      const response = await gRequestSuccess(
        updatePlaceNotExistQuery,
        testUser.admin,
      );

      expectNotFoundRequest(response);
    });

    it("Admin user should be allowed to update place", async () => {
      const response = await gRequestSuccess(
        updatePlaceQuery.replaceAll("testplace", "testplace5"),
        testUser.admin,
      );

      const data = expectData(response, {
        updatePlace: {
          name: "testplace5",
          parent: { id: parentPlaceId },
        },
      })["updatePlace"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.users).to.have.length(1);
      expect(data.users[0].id).to.equal(testUser.moderator2.user.id);
    });
  });

  describe("Test getPlace", () => {
    let placeId: number;
    let getPlaceQuery: string;

    before(async () => {
      placeId = (
        await PlaceService.createPlace("Getplace", undefined, {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
            { userId: testUser.default.user.id, permission: Permission.read },
          ],
        })
      ).id;

      getPlaceQuery = `query Query {
        place(id: ${placeId}){
          id, name, parent {id}, users {id}, devices {id}
        }
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getPlaceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(getPlaceQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined getting users", async () => {
      const response = await gRequestSuccess(getPlaceQuery, testUser.moderator);
      expectForbidden(response);
    });

    it("Place does not exist", async () => {
      const getPlaceEmptyQuery = `query Query {
        place(id: 123){
          id, name, parent{id}, users {id}, devices {id}
        }
      }`;
      const response = await gRequestSuccess(
        getPlaceEmptyQuery,
        testUser.moderator,
      );
      expectNotFoundRequest(response);
    });

    it("Admin user should be allowed to get place with users and devices", async () => {
      await DeviceService.createDevice(
        "TestDevice",
        "asdasdasd",
        "testdeviceType",
        DeviceStatus.development,
        placeId,
      );

      const response = await gRequestSuccess(getPlaceQuery, testUser.admin);

      const data = expectData(response, {
        place: {
          name: "Getplace",
          parent: null,
        },
      })["place"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.users).to.have.length(2);
      expect(data.devices).to.have.length(1);
    });

    it("Default user should be allowed to get place without users", async () => {
      const getPlaceWithoutUsersQuery = `query Query {
        place(id: ${placeId}){id, name, parent {id}, devices {id}}
      }`;

      const response = await gRequestSuccess(
        getPlaceWithoutUsersQuery,
        testUser.moderator,
      );

      const data = expectData(response, {
        place: {
          name: "Getplace",
          parent: null,
        },
      })["place"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.users).to.be.undefined;
      expect(data.devices).to.have.length(1);
    });
  });

  describe("Test getPlaces", () => {
    let placeId: number;
    let getPlacesQuery: string;

    before(async () => {
      await Device.remove(await DeviceService.getDevices());
      await Place.remove(await PlaceService.getPlaces());

      placeId = (
        await PlaceService.createPlace("Getplaces1", undefined, {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
            { userId: testUser.default.user.id, permission: Permission.read },
          ],
        })
      ).id;

      await PlaceService.createPlace("Getplaces2", undefined, {
        users: [
          { userId: testUser.moderator.user.id, permission: Permission.admin },
          { userId: testUser.default.user.id, permission: Permission.read },
        ],
      });

      getPlacesQuery = `query Query {
        places{
          id, name, parent {id}, users {id}, devices {id}
        }
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getPlacesQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(getPlacesQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined getting users", async () => {
      const response = await gRequestSuccess(
        getPlacesQuery,
        testUser.moderator,
      );
      expectForbidden(response);
    });

    it("Moderator 2 has no places", async () => {
      const getPlaceEmptyQuery = `query Query {
        places{
          id, name, parent{id}, devices {id}
        }
      }`;
      const response = await gRequestSuccess(
        getPlaceEmptyQuery,
        testUser.moderator2,
      );

      expect(response.body.data.places).to.be.empty;
    });

    it("Admin user should be allowed to get all places with users and devices", async () => {
      await DeviceService.createDevice(
        "TestDevice",
        "asdasdasdadasd",
        "testdeviceType",
        DeviceStatus.development,
        placeId,
      );

      const response = await gRequestSuccess(getPlacesQuery, testUser.admin);

      expect(response.body.data.places).to.have.length(2);
    });

    it("Default user should be allowed to get places without users", async () => {
      const getPlaceWithoutUsersQuery = `query Query {
        places{id, name, parent {id}, devices {id}}
      }`;

      const response = await gRequestSuccess(
        getPlaceWithoutUsersQuery,
        testUser.default,
      );

      expect(response.body.data.places).to.have.length(2);
    });
  });

  describe("Test deletePlace", () => {
    let placeId: number;
    let deletePlaceQuery: string;

    before(async () => {
      placeId = (
        await PlaceService.createPlace("DeletePlace", undefined, {
          users: [
            {
              userId: testUser.moderator.user.id,
              permission: Permission.admin,
            },
          ],
        })
      ).id;

      await PlaceService.createPlace("DeletePlaceParent", undefined, {
        users: [
          { userId: testUser.moderator.user.id, permission: Permission.admin },
        ],
      });

      deletePlaceQuery = `mutation Mutation {
        deletePlace(id: ${placeId})
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deletePlaceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deletePlaceQuery,
        testUser.default,
      );
      expectForbidden(response);
    });

    it("Admin user should not be allowed to delete place when devices exist", async () => {
      const device = await DeviceService.createDevice(
        "TestDevice",
        "asdasdaasdsd",
        "testdeviceType",
        DeviceStatus.development,
        placeId,
      );

      const response = await gRequestSuccess(deletePlaceQuery, testUser.admin);

      expectBadRequest(response);

      await DeviceService.deleteDevice(device.id);
    });

    it("Admin user should not be allowed to delete place when it has child places", async () => {
      const place = await PlaceService.createPlace("adasd", undefined, {
        parentId: placeId,
      });

      const response = await gRequestSuccess(deletePlaceQuery, testUser.admin);

      expectBadRequest(response);

      await PlaceService.deletePlace(place.id);
    });

    it("Admin user should be allowed to delete place when no devices and child places exist", async () => {
      const response = await gRequestSuccess(deletePlaceQuery, testUser.admin);

      expectData(response, {
        deletePlace: true,
      });
    });
  });
});
