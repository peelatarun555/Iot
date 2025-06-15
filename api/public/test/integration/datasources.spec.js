"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const datasource_schema_1 = require("@schemas/datasource.schema");
const datasource_service_1 = require("@services/datasource.service");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const db_helper_1 = require("./helper/db.helper");
const expect_helper_1 = require("./helper/expect.helper");
const server_helper_1 = require("./helper/server.helper");
(0, mocha_1.describe)("Test datasources", () => {
    let testUser;
    before(async () => {
        await (0, server_helper_1.initTest)();
        testUser = await (0, db_helper_1.createTestUsers)();
    });
    (0, mocha_1.describe)("Test createDatasource", () => {
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
            const response = await (0, server_helper_1.gRequestSuccess)(createDatasourceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatasourceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatasourceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to create new datasource", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatasourceQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                createDatasource: {
                    name: "Testdatasource",
                },
            })["createDatasource"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.token).to.be.not.undefined;
            (0, chai_1.expect)(new Date(data.expiresAt).getTime()).to.equal(dateTime.getTime());
        });
        it("Can not create datasource, when name aleady exists", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createDatasourceQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
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
            const response = await (0, server_helper_1.gRequestSuccess)(createDatasourceWithTokenQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                createDatasource: {
                    name: "Testdatasource2",
                },
            })["createDatasource"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.token).to.equal("öalksjdhlaksjnflsdkjnfösldmföslkdfn");
            (0, chai_1.expect)(new Date(data.expiresAt)).to.be.not.undefined;
        });
    });
    (0, mocha_1.describe)("Test updateDatasource", () => {
        const dateTime = new Date();
        let datasource;
        let updateDatasourceQuery;
        before(async () => {
            await datasource_service_1.DatasourceService.createDatasource("TestDatasource23");
            datasource = await datasource_service_1.DatasourceService.createDatasource("asdaskljdölasd");
            updateDatasourceQuery = `mutation Mutation {
      updateDatasource(id: ${datasource.id}, options: {expiresAt: "${dateTime.toISOString()}", name: "Testdatasource3", token: "asdasdaölfjsdölkfj"}) {
        id,
        name,
        token,
        expiresAt
      }
    }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatasourceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatasourceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatasourceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to update datasource", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatasourceQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                updateDatasource: {
                    name: "Testdatasource3",
                    token: "asdasdaölfjsdölkfj",
                },
            })["updateDatasource"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(new Date(data.expiresAt).getTime()).to.equal(dateTime.getTime());
        });
        it("Can not update datasource, when name aleady exists", async () => {
            const updateDatasourceQuery = `mutation Mutation {
            updateDatasource(id: ${datasource.id}, options: {expiresAt: "${dateTime.toISOString()}", name: "TestDatasource23", token: "asdasdaölfjsdölkfj"}) {
              id,
              name,
              token,
              expiresAt
            }
          }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateDatasourceQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
        });
    });
    (0, mocha_1.describe)("Test getDatasources", () => {
        const getDatasourceQuery = `query Query {
        datasources {
          id,
          name,
          token,
          expiresAt
        }
      }`;
        before(async () => {
            await datasource_schema_1.Datasource.clear();
            await datasource_service_1.DatasourceService.createDatasource("TestDatasource23");
            await datasource_service_1.DatasourceService.createDatasource("asdaskljdölasd");
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatasourceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatasourceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatasourceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to get datasources", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getDatasourceQuery, testUser.admin);
            (0, chai_1.expect)(response.body.data.datasources).to.have.length(2);
            (0, chai_1.expect)(response.body.data.datasources[0].name).to.equal("TestDatasource23");
            (0, chai_1.expect)(response.body.data.datasources[1].name).to.equal("asdaskljdölasd");
        });
    });
    (0, mocha_1.describe)("Test deleteDatasource", () => {
        let deleteDatasourceQuery;
        before(async () => {
            await datasource_schema_1.Datasource.clear();
            const datasource1 = await datasource_service_1.DatasourceService.createDatasource("TestDatasource23");
            await datasource_service_1.DatasourceService.createDatasource("asdaskljdölasd");
            deleteDatasourceQuery = `mutation Mutation {
        deleteDatasource(id: ${datasource1.id})
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatasourceQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatasourceQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatasourceQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Should not be able to delete not existing datasource", async () => {
            const deleteDatasourceNotExistQuery = `mutation Mutation {
            deleteDatasource(id: 8734)
          }`;
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatasourceNotExistQuery, testUser.moderator);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be allowed to delete datasources", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteDatasourceQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, { deleteDatasource: true });
        });
    });
});
