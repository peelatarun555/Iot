// import "reflect-metadata";

// import Device from "@schemas/device.schema";
// import Project from "@schemas/project.schema";
// import { DeviceService } from "@services/device.service";
// import PlaceService from "@services/place.service";
// import { ProjectService } from "@services/project.service";
// import { DeviceStatus, Permission } from "@utils/enums";
// import { expect } from "chai";
// import { describe } from "mocha";
// import { ITestUser, createTestUsers } from "./helper/db.helper";
// import {
//   expectData,
//   expectForbidden,
//   expectNotFoundRequest,
// } from "./helper/expect.helper";
// import { gRequestSuccess, initTest } from "./helper/server.helper";

// describe("Test project", () => {
//   let testUser: ITestUser;

//   before(async () => {
//     await initTest();
//     testUser = await createTestUsers();
//   });

//   describe("Test createProject", () => {
//     let device: Device;
//     let createProjectQuery: string;

//     before(async () => {
//       const place = await PlaceService.createPlace("testplace23", undefined);
//       device = await DeviceService.createDevice(
//         "testdevice",
//         "asdasdasfölsdöf",
//         "asdasd",
//         DeviceStatus.development,
//         place.id,
//         { sensors: [{ sensorType: "sensorType", name: "test" }] },
//       );

//       createProjectQuery = `mutation Mutation {
//         createProject(name: "TestProject", options: {users: [{userId: 1, permission: ${Permission.read}}], sensors: [${device.sensors[0].id}]}) {
//           id,
//           name,
//           users {id},
//           sensors {id}
//         }
//       }`;
//     });

//     it("Not authorized user should be declined", async () => {
//       const response = await gRequestSuccess(createProjectQuery);
//       expectForbidden(response);
//     });

//     it("Default user should be declined", async () => {
//       const response = await gRequestSuccess(
//         createProjectQuery,
//         testUser.default,
//       );
//       expectForbidden(response);
//     });

//     it("Admin user should be allowed to create new project", async () => {
//       const response = await gRequestSuccess(
//         createProjectQuery,
//         testUser.admin,
//       );

//       const data = expectData(response, {
//         createProject: {
//           name: "TestProject",
//         },
//       })["createProject"];

//       expect(data.id).to.be.greaterThanOrEqual(0);
//       expect(data.users).to.have.length(1);
//       +expect(data.sensors).to.have.length(1);
//     });
//   });

//   describe("Test updateProject", () => {
//     let projectId: number;
//     let updateProjectQuery: string;
//     let device: Device;

//     before(async () => {
//       const place = await PlaceService.createPlace("testplace3", undefined);
//       device = await DeviceService.createDevice(
//         "testdevice",
//         "asdasdasfasdölsdöf",
//         "asdasd",
//         DeviceStatus.development,
//         place.id,
//         {
//           sensors: [
//             { sensorType: "sensorType", name: "test" },
//             { sensorType: "sensorTypes", name: "tesst" },
//           ],
//         },
//       );

//       projectId = (
//         await ProjectService.createProject("CreateProject", {
//           users: [
//             {
//               userId: testUser.moderator.user.id,
//               permission: Permission.admin,
//             },
//           ],
//           sensors: [device.sensors[0].id],
//         })
//       ).id;

//       updateProjectQuery = `mutation Mutation {
//         updateProject(id: ${projectId}, options: {users: [{userId: ${testUser.moderator2.user.id}, permission: ${Permission.read}}], name: "testproject", sensors: [${device.sensors[1].id}] }) {
//           id,
//           name,
//           users {id},
//           sensors {id}
//         }
//       }`;
//     });

//     it("Not authorized user should be declined", async () => {
//       const response = await gRequestSuccess(updateProjectQuery);
//       expectForbidden(response);
//     });

//     it("Default user should be declined", async () => {
//       const response = await gRequestSuccess(
//         updateProjectQuery,
//         testUser.default,
//       );
//       expectForbidden(response);
//     });

//     it("Should not be able to update not existing project", async () => {
//       const updateProjectNotExistQuery = `mutation Mutation {
//         updateProject(id: 122, options: {users: [{userId: ${testUser.moderator2.user.id}, permission: ${Permission.read}}], name: "testproject" }) {
//           id,
//           name,
//           users {id},
//           sensors {id}
//         }
//       }`;

//       const response = await gRequestSuccess(
//         updateProjectNotExistQuery,
//         testUser.admin,
//       );

//       expectNotFoundRequest(response);
//     });

//     it("Should not be able to update project with not existing user", async () => {
//       const updateProjectNotExistQuery = `mutation Mutation {
//         updateProject(id: ${projectId}, options: {users: [{userId: 123, permission: ${Permission.read}}], name: "testproject" }) {
//           id,
//           name,
//           users {id},
//           sensors {id}
//         }
//       }`;

//       const response = await gRequestSuccess(
//         updateProjectNotExistQuery,
//         testUser.admin,
//       );

//       expectNotFoundRequest(response);
//     });

//     it("Should not be able to update project with not existing sensor", async () => {
//       const updateProjectNotExistQuery = `mutation Mutation {
//         updateProject(id: ${projectId}, options: {sensors: [1233]}) {
//           id,
//           name,
//           users {id},
//           sensors {id}
//         }
//       }`;

//       const response = await gRequestSuccess(
//         updateProjectNotExistQuery,
//         testUser.admin,
//       );

//       expectNotFoundRequest(response);
//     });

//     it("Admin user should be allowed to update project", async () => {
//       const response = await gRequestSuccess(
//         updateProjectQuery,
//         testUser.admin,
//       );

//       const data = expectData(response, {
//         updateProject: {
//           name: "testproject",
//         },
//       })["updateProject"];

//       expect(data.id).to.be.greaterThanOrEqual(0);
//       expect(data.users).to.have.length(1);
//       expect(data.users[0].id).to.equal(testUser.moderator2.user.id);
//       expect(data.sensors).to.have.length(1);
//       expect(data.sensors[0].id).to.equal(device.sensors[1].id);
//     });
//   });

//   describe("Test getProject", () => {
//     let projectId: number;
//     let getProjectQuery: string;

//     before(async () => {
//       const place = await PlaceService.createPlace("testplace4", undefined);
//       const device = await DeviceService.createDevice(
//         "testdevice",
//         "asdasdasfölq13döf",
//         "asdasd",
//         DeviceStatus.development,
//         place.id,
//         { sensors: [{ sensorType: "sensorType", name: "test" }] },
//       );

//       projectId = (
//         await ProjectService.createProject("Getproject", {
//           users: [
//             {
//               userId: testUser.moderator.user.id,
//               permission: Permission.admin,
//             },
//             { userId: testUser.default.user.id, permission: Permission.read },
//           ],
//           sensors: [device.sensors[0].id],
//         })
//       ).id;

//       getProjectQuery = `query Query {
//         project(id: ${projectId}){
//           id, name, users {id}, sensors {id}
//         }
//       }`;
//     });

//     it("Not authorized user should be declined", async () => {
//       const response = await gRequestSuccess(getProjectQuery);
//       expectForbidden(response);
//     });

//     it("Default user should be declined", async () => {
//       const response = await gRequestSuccess(getProjectQuery, testUser.default);
//       expectForbidden(response);
//     });

//     it("Moderator user should be declined getting users", async () => {
//       const response = await gRequestSuccess(
//         getProjectQuery,
//         testUser.moderator,
//       );

//       expectForbidden(response);
//     });

//     it("Project does not exist", async () => {
//       const getProjectEmptyQuery = `query Query {
//         project(id: 123){
//           id, name, users {id}, sensors {id}
//         }
//       }`;
//       const response = await gRequestSuccess(
//         getProjectEmptyQuery,
//         testUser.moderator,
//       );
//       expectNotFoundRequest(response);
//     });

//     it("Admin user should be allowed to get project with users and sensors", async () => {
//       const response = await gRequestSuccess(getProjectQuery, testUser.admin);

//       const data = expectData(response, {
//         project: {
//           name: "Getproject",
//         },
//       })["project"];

//       expect(data.id).to.be.greaterThanOrEqual(0);
//       expect(data.users).to.have.length(2);
//       expect(data.sensors).to.have.length(1);
//     });

//     it("Default user should be allowed to get project without users", async () => {
//       const getProjectWithoutUsersQuery = `query Query {
//         project(id: ${projectId}){id, name, sensors {id}}
//       }`;

//       const response = await gRequestSuccess(
//         getProjectWithoutUsersQuery,
//         testUser.moderator,
//       );

//       const data = expectData(response, {
//         project: {
//           name: "Getproject",
//         },
//       })["project"];

//       expect(data.id).to.be.greaterThanOrEqual(0);
//       expect(data.users).to.be.undefined;
//       expect(data.sensors).to.have.length(1);
//     });
//   });

//   describe("Test getProjects", () => {
//     let getProjectsQuery: string;

//     before(async () => {
//       await Device.remove(await DeviceService.getDevices());
//       await Project.remove(await ProjectService.getProjects());

//       await ProjectService.createProject("Getprojects1", {
//         users: [
//           { userId: testUser.moderator.user.id, permission: Permission.admin },
//           { userId: testUser.default.user.id, permission: Permission.read },
//         ],
//       });

//       getProjectsQuery = `query Query {
//         projects{
//           id, name, users {id}, sensors {id}
//         }
//       }`;
//     });

//     it("Not authorized user should be declined", async () => {
//       const response = await gRequestSuccess(getProjectsQuery);
//       expectForbidden(response);
//     });

//     it("Default user should be declined", async () => {
//       const response = await gRequestSuccess(
//         getProjectsQuery,
//         testUser.default,
//       );
//       expectForbidden(response);
//     });

//     it("Moderator user should be declined getting users", async () => {
//       const response = await gRequestSuccess(
//         getProjectsQuery,
//         testUser.moderator,
//       );
//       expectForbidden(response);
//     });

//     it("Moderator 2 has no projects", async () => {
//       const getProjectEmptyQuery = `query Query {
//         projects{
//           id, name, sensors {id}
//         }
//       }`;
//       const response = await gRequestSuccess(
//         getProjectEmptyQuery,
//         testUser.moderator2,
//       );

//       expect(response.body.data.projects).to.be.empty;
//     });

//     it("Admin user should be allowed to get all projects with users and devices", async () => {
//       const response = await gRequestSuccess(getProjectsQuery, testUser.admin);

//       expect(response.body.data.projects).to.have.length(2);
//     });

//     it("Default user should be allowed to get projects without users", async () => {
//       const getProjectWithoutUsersQuery = `query Query {
//         projects{id, name, sensors {id}}
//       }`;

//       const response = await gRequestSuccess(
//         getProjectWithoutUsersQuery,
//         testUser.default,
//       );

//       expect(response.body.data.projects).to.have.length(2);
//     });
//   });

//   describe("Test deleteProject", () => {
//     let projectId: number;
//     let deleteProjectQuery: string;

//     before(async () => {
//       projectId = (
//         await ProjectService.createProject("DeleteProject", {
//           users: [
//             {
//               userId: testUser.moderator.user.id,
//               permission: Permission.admin,
//             },
//           ],
//         })
//       ).id;

//       await ProjectService.createProject("DeleteProjectParent", {
//         users: [
//           { userId: testUser.moderator.user.id, permission: Permission.admin },
//         ],
//       });

//       deleteProjectQuery = `mutation Mutation {
//         deleteProject(id: ${projectId})
//       }`;
//     });

//     it("Not authorized user should be declined", async () => {
//       const response = await gRequestSuccess(deleteProjectQuery);
//       expectForbidden(response);
//     });

//     it("Default user should be declined", async () => {
//       const response = await gRequestSuccess(
//         deleteProjectQuery,
//         testUser.default,
//       );
//       expectForbidden(response);
//     });

//     it("Admin user should be allowed to delete project when no devices and child projects exist", async () => {
//       const response = await gRequestSuccess(
//         deleteProjectQuery,
//         testUser.admin,
//       );

//       expectData(response, {
//         deleteProject: true,
//       });
//     });
//   });
// });
