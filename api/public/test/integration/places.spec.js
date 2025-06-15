"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const place_schema_1 = __importDefault(require("@schemas/place.schema"));
const device_service_1 = require("@services/device.service");
const place_service_1 = __importDefault(require("@services/place.service"));
const enums_1 = require("@utils/enums");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const db_helper_1 = require("./helper/db.helper");
const expect_helper_1 = require("./helper/expect.helper");
const server_helper_1 = require("./helper/server.helper");
(0, mocha_1.describe)("Test place", () => {
    let testUser;
    before(async () => {
        await (0, server_helper_1.initTest)();
        testUser = await (0, db_helper_1.createTestUsers)();
    });
    (0, mocha_1.describe)("Test createPlace", () => {
        const createPlaceQuery = `mutation Mutation {
                    createPlace(name: "TestPlace", options: {users: [{userId: 1, permission: ${enums_1.Permission.read}}] }) {
                      id,
                      name,
                      parent {id},
                      users {id}
                    }
                  }`;
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createPlaceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createPlaceQuery.replaceAll("TestPlace", "TestPlace2"), testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to create new place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createPlaceQuery.replaceAll("TestPlace", "TestPlace3"), testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                createPlace: {
                    name: "TestPlace3",
                    parent: null,
                },
            })["createPlace"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.users).to.have.length(1);
        });
        it("Moderatur user should be allowed to create new place, but not get users", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createPlaceQuery.replaceAll("TestPlace", "TestPlace4"), testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderatur user should be allowed to create new place with parent", async () => {
            const place = await place_service_1.default.createPlace("testplace", testUser.moderator.user.id, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                ],
            });
            const createPlaceWithParentQuery = `mutation Mutation {
        createPlace(name: "TestPlace7", options: {users: [{userId: 1, permission: ${enums_1.Permission.write}}], parentId: ${place.id} }) {
          id,
          name,
          parent {name}
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(createPlaceWithParentQuery, testUser.moderator);
            const data = (0, expect_helper_1.expectData)(response, {
                createPlace: {
                    name: "TestPlace7",
                    parent: { name: "testplace" },
                },
            })["createPlace"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(1);
            (0, chai_1.expect)(data.users).to.be.undefined;
        });
    });
    (0, mocha_1.describe)("Test updatePlace", () => {
        let placeId;
        let parentPlaceId;
        let updatePlaceQuery;
        before(async () => {
            placeId = (await place_service_1.default.createPlace("CreatePlace", undefined, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                ],
            })).id;
            parentPlaceId = (await place_service_1.default.createPlace("CreatePlaceParent", undefined, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                ],
            })).id;
            updatePlaceQuery = `mutation Mutation {
        updatePlace(id: ${placeId}, options: {users: [{userId: ${testUser.moderator2.user.id}, permission: ${enums_1.Permission.read}}], name: "testplace", parentId: ${parentPlaceId} }) {
          id,
          name,
          parent {id},
          users {id}
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updatePlaceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updatePlaceQuery.replaceAll("testplace", "testplace2"), testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Should not be able to update not existing place", async () => {
            const updatePlaceNotExistQuery = `mutation Mutation {
        updatePlace(id: 122, options: {users: [{userId: ${testUser.moderator2.user.id}, permission: ${enums_1.Permission.read}}], name: "testplace", parentId: ${parentPlaceId} }) {
          id,
          name,
          parent {id},
          users {id}
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updatePlaceNotExistQuery, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Should not be able to update place with not existing user", async () => {
            const updatePlaceNotExistQuery = `mutation Mutation {
        updatePlace(id: ${placeId}, options: {users: [{userId: 123, permission: ${enums_1.Permission.read}}], name: "testplace", parentId: ${parentPlaceId} }) {
          id,
          name,
          parent {id},
          users {id}
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updatePlaceNotExistQuery, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be allowed to update place", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updatePlaceQuery.replaceAll("testplace", "testplace5"), testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                updatePlace: {
                    name: "testplace5",
                    parent: { id: parentPlaceId },
                },
            })["updatePlace"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.users).to.have.length(1);
            (0, chai_1.expect)(data.users[0].id).to.equal(testUser.moderator2.user.id);
        });
    });
    (0, mocha_1.describe)("Test getPlace", () => {
        let placeId;
        let getPlaceQuery;
        before(async () => {
            placeId = (await place_service_1.default.createPlace("Getplace", undefined, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                    { userId: testUser.default.user.id, permission: enums_1.Permission.read },
                ],
            })).id;
            getPlaceQuery = `query Query {
        place(id: ${placeId}){
          id, name, parent {id}, users {id}, devices {id}
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined getting users", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Place does not exist", async () => {
            const getPlaceEmptyQuery = `query Query {
        place(id: 123){
          id, name, parent{id}, users {id}, devices {id}
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceEmptyQuery, testUser.moderator);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be allowed to get place with users and devices", async () => {
            await device_service_1.DeviceService.createDevice("TestDevice", "asdasdasd", "testdeviceType", enums_1.DeviceStatus.development, placeId);
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                place: {
                    name: "Getplace",
                    parent: null,
                },
            })["place"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.users).to.have.length(2);
            (0, chai_1.expect)(data.devices).to.have.length(1);
        });
        it("Default user should be allowed to get place without users", async () => {
            const getPlaceWithoutUsersQuery = `query Query {
        place(id: ${placeId}){id, name, parent {id}, devices {id}}
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceWithoutUsersQuery, testUser.moderator);
            const data = (0, expect_helper_1.expectData)(response, {
                place: {
                    name: "Getplace",
                    parent: null,
                },
            })["place"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.users).to.be.undefined;
            (0, chai_1.expect)(data.devices).to.have.length(1);
        });
    });
    (0, mocha_1.describe)("Test getPlaces", () => {
        let placeId;
        let getPlacesQuery;
        before(async () => {
            await device_schema_1.default.remove(await device_service_1.DeviceService.getDevices());
            await place_schema_1.default.remove(await place_service_1.default.getPlaces());
            placeId = (await place_service_1.default.createPlace("Getplaces1", undefined, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                    { userId: testUser.default.user.id, permission: enums_1.Permission.read },
                ],
            })).id;
            await place_service_1.default.createPlace("Getplaces2", undefined, {
                users: [
                    { userId: testUser.moderator.user.id, permission: enums_1.Permission.admin },
                    { userId: testUser.default.user.id, permission: enums_1.Permission.read },
                ],
            });
            getPlacesQuery = `query Query {
        places{
          id, name, parent {id}, users {id}, devices {id}
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getPlacesQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getPlacesQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined getting users", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getPlacesQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator 2 has no places", async () => {
            const getPlaceEmptyQuery = `query Query {
        places{
          id, name, parent{id}, devices {id}
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceEmptyQuery, testUser.moderator2);
            (0, chai_1.expect)(response.body.data.places).to.be.empty;
        });
        it("Admin user should be allowed to get all places with users and devices", async () => {
            await device_service_1.DeviceService.createDevice("TestDevice", "asdasdasdadasd", "testdeviceType", enums_1.DeviceStatus.development, placeId);
            const response = await (0, server_helper_1.gRequestSuccess)(getPlacesQuery, testUser.admin);
            (0, chai_1.expect)(response.body.data.places).to.have.length(2);
        });
        it("Default user should be allowed to get places without users", async () => {
            const getPlaceWithoutUsersQuery = `query Query {
        places{id, name, parent {id}, devices {id}}
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(getPlaceWithoutUsersQuery, testUser.default);
            (0, chai_1.expect)(response.body.data.places).to.have.length(2);
        });
    });
    (0, mocha_1.describe)("Test deletePlace", () => {
        let placeId;
        let deletePlaceQuery;
        before(async () => {
            placeId = (await place_service_1.default.createPlace("DeletePlace", undefined, {
                users: [
                    {
                        userId: testUser.moderator.user.id,
                        permission: enums_1.Permission.admin,
                    },
                ],
            })).id;
            await place_service_1.default.createPlace("DeletePlaceParent", undefined, {
                users: [
                    { userId: testUser.moderator.user.id, permission: enums_1.Permission.admin },
                ],
            });
            deletePlaceQuery = `mutation Mutation {
        deletePlace(id: ${placeId})
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deletePlaceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deletePlaceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should not be allowed to delete place when devices exist", async () => {
            const device = await device_service_1.DeviceService.createDevice("TestDevice", "asdasdaasdsd", "testdeviceType", enums_1.DeviceStatus.development, placeId);
            const response = await (0, server_helper_1.gRequestSuccess)(deletePlaceQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
            await device_service_1.DeviceService.deleteDevice(device.id);
        });
        it("Admin user should not be allowed to delete place when it has child places", async () => {
            const place = await place_service_1.default.createPlace("adasd", undefined, {
                parentId: placeId,
            });
            const response = await (0, server_helper_1.gRequestSuccess)(deletePlaceQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
            await place_service_1.default.deletePlace(place.id);
        });
        it("Admin user should be allowed to delete place when no devices and child places exist", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deletePlaceQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                deletePlace: true,
            });
        });
    });
});
