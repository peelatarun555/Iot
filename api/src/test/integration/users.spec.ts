import "reflect-metadata";

import User from "@schemas/user.schema";
import { UserService } from "@services/user.service";
import { Role } from "@utils/enums";
import { expect } from "chai";
import { describe } from "mocha";
import { ITestUser, createTestUsers } from "./helper/db.helper";
import {
  expectBadRequest,
  expectData,
  expectForbidden,
  expectNotFoundRequest,
  expectUnauthorized,
} from "./helper/expect.helper";
import { gRequestSuccess, initTest } from "./helper/server.helper";

describe("Test user", () => {
  let testUser: ITestUser;

  before(async () => {
    await initTest();
    testUser = await createTestUsers();
  });

  describe("Test createUser", () => {
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
      const response = await gRequestSuccess(createUserQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(createUserQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        createUserQuery,
        testUser.moderator
      );
      expectForbidden(response);
    });

    it("Admin user should be allowed to create new user", async () => {
      const response = await gRequestSuccess(createUserQuery, testUser.admin);
      const data = expectData(response, {
        createUser: {
          email: "test@test.de",
          firstname: "Testuser",
          lastname: "Test",
          role: Role.default,
          password: null,
          lastPasswordResetAt: null,
        },
      })["createUser"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.passwordTmp).to.have.length(8);
      expect(data.registeredAt).to.be.not.undefined;
    });

    it("Should not be able to create duplicate user", async () => {
      const response = await gRequestSuccess(createUserQuery, testUser.admin);
      expectBadRequest(response);
    });

    it("Should be able to create a admin user", async () => {
      const response = await gRequestSuccess(
        createAdminUserQuery,
        testUser.admin
      );
      const data = expectData(response, {
        createUser: {
          email: "test2@test.de",
          firstname: "Testuser",
          lastname: "Test",
          role: Role.admin,
          passwordTmp: null,
          lastPasswordResetAt: null,
        },
      })["createUser"];
      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.password).to.be.not.null;
      expect(new Date(data.registeredAt).toISOString().slice(0, 19)).to.equal(
        currentTime.toISOString().slice(0, 19)
      );
    });
  });

  describe("Test updateUser", () => {
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
      const user = await UserService.createUser(
        "testupdate@test.com",
        "test",
        "test",
        {
          role: Role.default,
        }
      );
      userId = user.id.toString();

      updateUserQuery = updateUserQuery.replace(
        "id: 1",
        "id: " + user.id.toString()
      );
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(updateUserQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(updateUserQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        updateUserQuery,
        testUser.moderator
      );
      expectForbidden(response);
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
      const response = await gRequestSuccess(
        emptyUpdateUserQuery,
        testUser.admin
      );
      expectNotFoundRequest(response);
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
      const response = await gRequestSuccess(
        duplicateUpdateUserQuery,
        testUser.admin
      );
      expectBadRequest(response);
    });

    it("Admin user should be allowed to update user", async () => {
      const response = await gRequestSuccess(updateUserQuery, testUser.admin);

      const data = expectData(response, {
        updateUser: {
          email: "testupdate2@test.de",
          firstname: "test1",
          lastname: "test2",
          role: Role.default,
          password: null,
          lastPasswordResetAt: null,
        },
      })["updateUser"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.passwordTmp).to.have.length(8);
      expect(data.registeredAt).to.be.not.undefined;
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

      const response = await gRequestSuccess(updateQuery, testUser.admin);

      const data = expectData(response, {
        updateUser: {
          email: "testupdate3@test.de",
          firstname: "test2",
          lastname: "test3",
          role: Role.admin,
          lastPasswordResetAt: null,
        },
      })["updateUser"];

      expect(data.id).to.be.greaterThanOrEqual(0);
      expect(data.password).to.be.not.null;
      expect(data.registeredAt).to.be.not.undefined;
    });
  });

  describe("Test getUser", () => {
    let user: User;
    let getUserQuery: string;

    before(async () => {
      user = await UserService.createUser("testget@test.com", "test", "test", {
        role: Role.default,
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
      const response = await gRequestSuccess(getUserQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(getUserQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(getUserQuery, testUser.moderator);
      expectForbidden(response);
    });

    it("Admin user should be allowed to access user", async () => {
      const response = await gRequestSuccess(getUserQuery, testUser.admin);

      expectData(response, {
        user: {
          email: "testget@test.com",
          firstname: "test",
          lastname: "test",
          role: Role.default,
        },
      })["user"];
    });

    it("Should be allowed to access self", async () => {
      const token = await UserService.loginUser("testget@test.com", "password");

      const getSelfQuery = `query Query {
                              user {
                                id,
                                email,
                                firstname,
                                lastname,
                                registeredAt
                              }
                            }`;

      const response = await gRequestSuccess(getSelfQuery, {
        token: token,
      });

      expectData(response, {
        user: {
          email: "testget@test.com",
          firstname: "test",
          lastname: "test",
        },
      })["user"];
    });
  });

  describe("Test getUser", () => {
    let getUserQuery: string;

    before(async () => {
      await UserService.createUser("testgets@test.com", "test", "test", {
        role: Role.default,
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
      const response = await gRequestSuccess(getUserQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(getUserQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(getUserQuery, testUser.moderator);
      expectForbidden(response);
    });

    it("Admin user should be allowed to get users", async () => {
      const response = await gRequestSuccess(getUserQuery, testUser.admin);

      expect(response.body.data.users).to.be.not.empty;

      expect(
        response.body.data.users.find(
          (u: any) => u.email == "testgets@test.com"
        )
      ).to.be.not.null;
    });
  });

  describe("Test loginUser", () => {
    let loginUserQuery = "";

    before(async () => {
      await UserService.createUser("testlogin@test.com", "test", "test", {
        role: Role.default,
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

      const response = await gRequestSuccess(wrongCredQuery);

      expectUnauthorized(response);
    });

    it("Right credentials should be accepted", async () => {
      const response = await gRequestSuccess(loginUserQuery);

      expect(response.body.data.loginUser).to.be.not.null;
    });
  });

  describe("Test setUserPassword", () => {
    let setUserPasswordQuery = "";
    let user: User;

    before(async () => {
      user = await UserService.createUser(
        "testSetPassword@test.com",
        "test",
        "test",
        {
          role: Role.default,
        }
      );

      setUserPasswordQuery = `mutation Mutation {
        setUserPassword(email: "testSetPassword@test.com", password: "password", passwordTmp: "${user.passwordTmp}")
      }`;
    });

    it("Wrong credentials should be declined", async () => {
      const wrongCredQuery = `mutation Mutation {
        setUserPassword(email: "testSetPassword@test.com", password: "password", passwordTmp: "asd12312")
      }`;

      const response = await gRequestSuccess(wrongCredQuery);

      expectUnauthorized(response);
    });

    it("Right credentials should be declined", async () => {
      const response = await gRequestSuccess(setUserPasswordQuery);

      expect(response.body.data?.setUserPassword).to.be.not.null;
    });
  });

  describe("Test resetUserPassword", () => {
    let resetUserPasswordQuery = "";
    let user: User;

    before(async () => {
      user = await UserService.createUser(
        "testResetPassword@test.com",
        "test",
        "test",
        {
          role: Role.default,
        }
      );

      resetUserPasswordQuery = `mutation Mutation {
        resetUserPassword(email: "testResetPassword@test.com")
      }`;
    });

    it("Email does not exist in db", async () => {
      const wrongCredQuery = `mutation Mutation {
        resetUserPassword(email: "test2ResetPassword@test.com")
      }`;

      const response = await gRequestSuccess(wrongCredQuery);

      expectNotFoundRequest(response);
    });

    it("Right email should be reset password", async () => {
      const response = await gRequestSuccess(resetUserPasswordQuery);

      expect(response.body.data.resetUserPassword).to.be.true;

      const userUpdated = await UserService.getUser(user.id);

      expect(userUpdated.lastPasswordResetAt).to.be.not.null;
    });
  });

  describe("Test deleteUser", () => {
    let deleteUserQuery = "";

    before(async () => {
      const user = await UserService.createUser(
        "testdelete@test.com",
        "test",
        "test",
        {
          role: Role.default,
        }
      );

      deleteUserQuery = `mutation Mutation {
        deleteUser(id: ${user.id})
      }`;
    });

    it("Not authorized user should be declined", async () => {
      const response = await gRequestSuccess(deleteUserQuery);
      expectForbidden(response);
    });

    it("Default user should be declined", async () => {
      const response = await gRequestSuccess(deleteUserQuery, testUser.default);
      expectForbidden(response);
    });

    it("Moderator user should be declined", async () => {
      const response = await gRequestSuccess(
        deleteUserQuery,
        testUser.moderator
      );
      expectForbidden(response);
    });

    it("Should not be able to update not existing user", async () => {
      const emptyDeleteUserQuery = `mutation Mutation {
        deleteUser(id: 421)
      }`;
      const response = await gRequestSuccess(
        emptyDeleteUserQuery,
        testUser.admin
      );

      expectNotFoundRequest(response);
    });

    it("Admin user should be allowed to delete user", async () => {
      const response = await gRequestSuccess(deleteUserQuery, testUser.admin);

      expectData(response, {
        deleteUser: true,
      });
    });
  });
});
