import "reflect-metadata";

import { Datasource } from "@schemas/datasource.schema";
import { DatasourceService } from "@services/datasource.service";
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

describe("Test datasources", () => {
  let testUser: ITestUser;

  before(async () => {
    await initTest();
    testUser = await createTestUsers();
  });

  describe("Test createDatasource", () => {
    const dateTime = new Date();

    const createDatasourceQuery = `mutation Mutation {
                    createDatasource(name: "Testdatasource", options: {expiresAt: "${dateTime.toISOString()}"}) {
                      id,
                      name,
                      token,
                      expiresAt
                    }
                  }`;

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(createDatasourceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        createDatasourceQuery,
        testUser.default
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        createDatasourceQuery,
        testUser.moderator
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to create new datasource", async () => {
      const response = await gRequestSuccess(
        createDatasourceQuery,
        testUser.admin
      );
      const data = expectData(response, {
        createDatasource: {
          name: "Testdatasource",
        },
      })["createDatasource"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.token).to.be.not.undefined;
      expect(new Date(data.expiresAt).getTime()).to.equal(dateTime.getTime());
    });

    it("Can not create datasource, when name aleady exists", async () => {
      const response = await gRequestSuccess(
        createDatasourceQuery,
        testUser.admin
      );
      expectBadRequest(response);
    });

    it("Admin user should be allowed to create new datasource with token", async () => {
      const createDatasourceWithTokenQuery = `mutation Mutation {
            createDatasource(name: "Testdatasource2", options: {token: "öalksjdhlaksjnflsdkjnfösldmföslkdfn"}) {
              id,
              name,
              token,
              expiresAt
            }
          }`;

      const response = await gRequestSuccess(
        createDatasourceWithTokenQuery,
        testUser.admin
      );
      const data = expectData(response, {
        createDatasource: {
          name: "Testdatasource2",
        },
      })["createDatasource"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.token).to.equal("öalksjdhlaksjnflsdkjnfösldmföslkdfn");
      expect(new Date(data.expiresAt)).to.be.not.undefined;
    });
  });

  describe("Test updateDatasource", () => {
    const dateTime = new Date();
    let datasource: Datasource;
    let updateDatasourceQuery: string;

    before(async () => {
      await DatasourceService.createDatasource("TestDatasource23");
      datasource = await DatasourceService.createDatasource("asdaskljdölasd");

      updateDatasourceQuery = `mutation Mutation {
      updateDatasource(id: ${
        datasource.id
      }, options: {expiresAt: "${dateTime.toISOString()}", name: "Testdatasource3", token: "asdasdaölfjsdölkfj"}) {
        id,
        name,
        token,
        expiresAt
      }
    }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(updateDatasourceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        updateDatasourceQuery,
        testUser.default
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        updateDatasourceQuery,
        testUser.moderator
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to update datasource", async () => {
      const response = await gRequestSuccess(
        updateDatasourceQuery,
        testUser.admin
      );

      const data = expectData(response, {
        updateDatasource: {
          name: "Testdatasource3",
          token: "asdasdaölfjsdölkfj",
        },
      })["updateDatasource"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(new Date(data.expiresAt).getTime()).to.equal(dateTime.getTime());
    });

    it("Can not update datasource, when name aleady exists", async () => {
      const updateDatasourceQuery = `mutation Mutation {
            updateDatasource(id: ${
              datasource.id
            }, options: {expiresAt: "${dateTime.toISOString()}", name: "TestDatasource23", token: "asdasdaölfjsdölkfj"}) {
              id,
              name,
              token,
              expiresAt
            }
          }`;
      const response = await gRequestSuccess(
        updateDatasourceQuery,
        testUser.admin
      );
      expectBadRequest(response);
    });
  });

  describe("Test getDatasources", () => {
    const getDatasourceQuery = `query Query {
        datasources {
          id,
          name,
          token,
          expiresAt
        }
      }`;

    before(async () => {
      await Datasource.clear();
      await DatasourceService.createDatasource("TestDatasource23");
      await DatasourceService.createDatasource("asdaskljdölasd");
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(getDatasourceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        getDatasourceQuery,
        testUser.default
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        getDatasourceQuery,
        testUser.moderator
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to get datasources", async () => {
      const response = await gRequestSuccess(
        getDatasourceQuery,
        testUser.admin
      );

      expect(response.body.data.datasources).to.have.length(2);
      expect(response.body.data.datasources[0].name).to.equal(
        "TestDatasource23"
      );
      expect(response.body.data.datasources[1].name).to.equal("asdaskljdölasd");
    });
  });

  describe("Test deleteDatasource", () => {
    let deleteDatasourceQuery: string;

    before(async () => {
      await Datasource.clear();
      const datasource1 =
        await DatasourceService.createDatasource("TestDatasource23");
      await DatasourceService.createDatasource("asdaskljdölasd");

      deleteDatasourceQuery = `mutation Mutation {
        deleteDatasource(id: ${datasource1.id})
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteDatasourceQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatasourceQuery,
        testUser.default
      );
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteDatasourceQuery,
        testUser.moderator
      );
      expectForbidden(response);
    });

    it("Should not be able to delete not existing datasource", async () => {
      const deleteDatasourceNotExistQuery = `mutation Mutation {
            deleteDatasource(id: 8734)
          }`;

      const response = await gRequestSuccess(
        deleteDatasourceNotExistQuery,
        testUser.moderator
      );
      expectNotFoundRequest(response);
    });

    it("Admin user should be allowed to delete datasources", async () => {
      const response = await gRequestSuccess(
        deleteDatasourceQuery,
        testUser.admin
      );

      expectData(response, { deleteDatasource: true });
    });
  });
});
