"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const user_service_1 = require("@services/user.service");
const enums_1 = require("@utils/enums");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const db_helper_1 = require("./helper/db.helper");
const expect_helper_1 = require("./helper/expect.helper");
const server_helper_1 = require("./helper/server.helper");
(0, mocha_1.describe)("Test user", () => {
    let testUser;
    before(async () => {
        await (0, server_helper_1.initTest)();
        testUser = await (0, db_helper_1.createTestUsers)();
    });
    (0, mocha_1.describe)("Test createUser", () => {
        const currentTime = new Date();
        const createUserQuery = `mutation Mutation {
                    createUser(email: "test@test.de", firstname: "Testuser", lastname: "Test") {
                      id,
                      email,
                      firstname,
                      lastname,
                      password,
                      passwordTmp,
                      lastPasswordResetAt,
                      registeredAt,
                      role
                    }
                  }`;
        const createAdminUserQuery = `mutation Mutation {
                    createUser(email: "test2@test.de", firstname: "Testuser", lastname: "Test" options: {password: "password", role: "admin", registeredAt: "${currentTime.toISOString()}"}) {
                      id,
                      email,
                      firstname,
                      lastname,
                      password,
                      passwordTmp,
                      lastPasswordResetAt,
                      registeredAt,
                      role
                    }
                  }`;
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createUserQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createUserQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createUserQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to create new user", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createUserQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                createUser: {
                    email: "test@test.de",
                    firstname: "Testuser",
                    lastname: "Test",
                    role: enums_1.Role.default,
                    password: null,
                    lastPasswordResetAt: null,
                },
            })["createUser"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.passwordTmp).to.have.length(8);
            (0, chai_1.expect)(data.registeredAt).to.be.not.undefined;
        });
        it("Should not be able to create duplicate user", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createUserQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
        });
        it("Should be able to create a admin user", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(createAdminUserQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                createUser: {
                    email: "test2@test.de",
                    firstname: "Testuser",
                    lastname: "Test",
                    role: enums_1.Role.admin,
                    passwordTmp: null,
                    lastPasswordResetAt: null,
                },
            })["createUser"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.password).to.be.not.null;
            (0, chai_1.expect)(new Date(data.registeredAt).toISOString().slice(0, 19)).to.equal(currentTime.toISOString().slice(0, 19));
        });
    });
    (0, mocha_1.describe)("Test updateUser", () => {
        let userId = "";
        let updateUserQuery = `mutation Mutation {
                    updateUser(id: 1, options: {email: "testupdate2@test.de", firstname: "test1", lastname: "test2"}) {
                      id,
                      email,
                      firstname,
                      lastname,
                      password,
                      passwordTmp,
                      lastPasswordResetAt,
                      registeredAt,
                      role
                    }
                  }`;
        before(async () => {
            const user = await user_service_1.UserService.createUser("testupdate@test.com", "test", "test", {
                role: enums_1.Role.default,
            });
            userId = user.id.toString();
            updateUserQuery = updateUserQuery.replace("id: 1", "id: " + user.id.toString());
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateUserQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateUserQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateUserQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Should not be able to update not existing user", async () => {
            const emptyUpdateUserQuery = `mutation Mutation {
        updateUser(id: 12312) {
          id,
          email,
          firstname,
          lastname,
          password,
          passwordTmp,
          lastPasswordResetAt,
          registeredAt,
          role
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(emptyUpdateUserQuery, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Should not be able to update existing email", async () => {
            const duplicateUpdateUserQuery = `mutation Mutation {
        updateUser(id: ${userId}, options: {email: "test@test.de"}) {
          id,
          email,
          firstname,
          lastname,
          password,
          passwordTmp,
          lastPasswordResetAt,
          registeredAt,
          role
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(duplicateUpdateUserQuery, testUser.admin);
            (0, expect_helper_1.expectBadRequest)(response);
        });
        it("Admin user should be allowed to update user", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(updateUserQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                updateUser: {
                    email: "testupdate2@test.de",
                    firstname: "test1",
                    lastname: "test2",
                    role: enums_1.Role.default,
                    password: null,
                    lastPasswordResetAt: null,
                },
            })["updateUser"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.passwordTmp).to.have.length(8);
            (0, chai_1.expect)(data.registeredAt).to.be.not.undefined;
        });
        it("Should be able to update a admin user", async () => {
            const updateQuery = `mutation Mutation {
        updateUser(id: ${userId}, options: {email: "testupdate3@test.de", firstname: "test2", lastname: "test3", role: "admin", password: "password"}) {
          id,
          email,
          firstname,
          lastname,
          password,
          passwordTmp,
          lastPasswordResetAt,
          registeredAt,
          role
        }
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(updateQuery, testUser.admin);
            const data = (0, expect_helper_1.expectData)(response, {
                updateUser: {
                    email: "testupdate3@test.de",
                    firstname: "test2",
                    lastname: "test3",
                    role: enums_1.Role.admin,
                    lastPasswordResetAt: null,
                },
            })["updateUser"];
            (0, chai_1.expect)(data.id).to.be.greaterThanOrEqual(0);
            (0, chai_1.expect)(data.password).to.be.not.null;
            (0, chai_1.expect)(data.registeredAt).to.be.not.undefined;
        });
    });
    (0, mocha_1.describe)("Test getUser", () => {
        let user;
        let getUserQuery;
        before(async () => {
            user = await user_service_1.UserService.createUser("testget@test.com", "test", "test", {
                role: enums_1.Role.default,
                password: "password",
            });
            getUserQuery = `query Query {
        user(id: ${user.id}) {
          id,
          email,
          firstname,
          lastname,
          password,
          passwordTmp,
          lastPasswordResetAt,
          registeredAt,
          role
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to access user", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                user: {
                    email: "testget@test.com",
                    firstname: "test",
                    lastname: "test",
                    role: enums_1.Role.default,
                },
            })["user"];
        });
        it("Should be allowed to access self", async () => {
            const token = await user_service_1.UserService.loginUser("testget@test.com", "password");
            const getSelfQuery = `query Query {
                              user {
                                id,
                                email,
                                firstname,
                                lastname,
                                registeredAt
                              }
                            }`;
            const response = await (0, server_helper_1.gRequestSuccess)(getSelfQuery, {
                token: token,
            });
            (0, expect_helper_1.expectData)(response, {
                user: {
                    email: "testget@test.com",
                    firstname: "test",
                    lastname: "test",
                },
            })["user"];
        });
    });
    (0, mocha_1.describe)("Test getUser", () => {
        let getUserQuery;
        before(async () => {
            await user_service_1.UserService.createUser("testgets@test.com", "test", "test", {
                role: enums_1.Role.default,
                password: "password",
            });
            getUserQuery = `query Query {
        users {
          id,
          email,
          firstname,
          lastname,
          password,
          passwordTmp,
          lastPasswordResetAt,
          registeredAt,
          role
        }
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Admin user should be allowed to get users", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(getUserQuery, testUser.admin);
            (0, chai_1.expect)(response.body.data.users).to.be.not.empty;
            (0, chai_1.expect)(response.body.data.users.find((u) => u.email == "testgets@test.com")).to.be.not.null;
        });
    });
    (0, mocha_1.describe)("Test loginUser", () => {
        let loginUserQuery = "";
        before(async () => {
            await user_service_1.UserService.createUser("testlogin@test.com", "test", "test", {
                role: enums_1.Role.default,
                password: "password",
            });
            loginUserQuery = `mutation Mutation {
        loginUser(email: "testlogin@test.com", password: "password")
      }`;
        });
        it("Wrong credentials should be declined", async () => {
            const wrongCredQuery = `mutation Mutation {
        loginUser(email: "testlogin@test.com", password: "pssword")
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(wrongCredQuery);
            (0, expect_helper_1.expectUnauthorized)(response);
        });
        it("Right credentials should be accepted", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(loginUserQuery);
            (0, chai_1.expect)(response.body.data.loginUser).to.be.not.null;
        });
    });
    (0, mocha_1.describe)("Test setUserPassword", () => {
        let setUserPasswordQuery = "";
        let user;
        before(async () => {
            user = await user_service_1.UserService.createUser("testSetPassword@test.com", "test", "test", {
                role: enums_1.Role.default,
            });
            setUserPasswordQuery = `mutation Mutation {
        setUserPassword(email: "testSetPassword@test.com", password: "password", passwordTmp: "${user.passwordTmp}")
      }`;
        });
        it("Wrong credentials should be declined", async () => {
            const wrongCredQuery = `mutation Mutation {
        setUserPassword(email: "testSetPassword@test.com", password: "password", passwordTmp: "asd12312")
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(wrongCredQuery);
            (0, expect_helper_1.expectUnauthorized)(response);
        });
        it("Right credentials should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(setUserPasswordQuery);
            (0, chai_1.expect)(response.body.data?.setUserPassword).to.be.not.null;
        });
    });
    (0, mocha_1.describe)("Test resetUserPassword", () => {
        let resetUserPasswordQuery = "";
        let user;
        before(async () => {
            user = await user_service_1.UserService.createUser("testResetPassword@test.com", "test", "test", {
                role: enums_1.Role.default,
            });
            resetUserPasswordQuery = `mutation Mutation {
        resetUserPassword(email: "testResetPassword@test.com")
      }`;
        });
        it("Email does not exist in db", async () => {
            const wrongCredQuery = `mutation Mutation {
        resetUserPassword(email: "test2ResetPassword@test.com")
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(wrongCredQuery);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Right email should be reset password", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(resetUserPasswordQuery);
            (0, chai_1.expect)(response.body.data.resetUserPassword).to.be.true;
            const userUpdated = await user_service_1.UserService.getUser(user.id);
            (0, chai_1.expect)(userUpdated.lastPasswordResetAt).to.be.not.null;
        });
    });
    (0, mocha_1.describe)("Test deleteUser", () => {
        let deleteUserQuery = "";
        before(async () => {
            const user = await user_service_1.UserService.createUser("testdelete@test.com", "test", "test", {
                role: enums_1.Role.default,
            });
            deleteUserQuery = `mutation Mutation {
        deleteUser(id: ${user.id})
      }`;
        });
        it("Not authorized user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteUserQuery);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Default user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteUserQuery, testUser.default);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Moderator user should be declined", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteUserQuery, testUser.moderator);
            (0, expect_helper_1.expectForbidden)(response);
        });
        it("Should not be able to update not existing user", async () => {
            const emptyDeleteUserQuery = `mutation Mutation {
        deleteUser(id: 421)
      }`;
            const response = await (0, server_helper_1.gRequestSuccess)(emptyDeleteUserQuery, testUser.admin);
            (0, expect_helper_1.expectNotFoundRequest)(response);
        });
        it("Admin user should be allowed to delete user", async () => {
            const response = await (0, server_helper_1.gRequestSuccess)(deleteUserQuery, testUser.admin);
            (0, expect_helper_1.expectData)(response, {
                deleteUser: true,
            });
        });
    });
});
