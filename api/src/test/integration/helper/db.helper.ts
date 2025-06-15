import "reflect-metadata";

import { datasource } from "@db/timescaledb/timescaledb.datasource";
import User from "@schemas/user.schema";
import { UserService } from "@services/user.service";
import Logger from "@tightec/logger";
import { Role } from "@utils/enums";
import DatabaseException from "@utils/exceptions/database.exception";

/**
 * Clean tables of timescaledb
 */
export async function cleanTimescaleDb(): Promise<void> {
  try {
    await datasource.query(`
       TRUNCATE TABLE "users", "places", "datapoints", "datasources", "devices", "sensors", "projects", "place_access", "project_access", "locations" RESTART IDENTITY CASCADE;
    `);

    Logger.info("TIMESCALEDB TEST DATABASE: Clean");
  } catch (error) {
    throw new DatabaseException(`TimescaleDb cleaning error: ${error}`);
  }
}

/**
 * Create users with different roles for testing
 */
export async function createTestUsers(): Promise<ITestUser> {
  const response = await Promise.all([
    UserService.createUser("admin@eotlab.de", "admin", "admin", {
      role: Role.admin,
      password: "password",
    }),
    UserService.createUser("default@eotlab.de", "default", "default", {
      role: Role.default,
      password: "password",
    }),
    UserService.createUser("moderator@eotlab.de", "moderator", "moderator", {
      role: Role.moderator,
      password: "password",
    }),
    UserService.createUser("moderator2@eotlab.de", "moderator2", "moderator2", {
      role: Role.moderator,
      password: "password",
    }),
  ]);

  const tokens = await Promise.all([
    UserService.loginUser("admin@eotlab.de", "password"),
    UserService.loginUser("default@eotlab.de", "password"),
    UserService.loginUser("moderator@eotlab.de", "password"),
    UserService.loginUser("moderator2@eotlab.de", "password"),
  ]);

  return {
    admin: { user: response[0], token: tokens[0] },
    default: { user: response[1], token: tokens[1] },
    moderator: { user: response[2], token: tokens[2] },
    moderator2: { user: response[3], token: tokens[3] },
  };
}

export interface ITestUser {
  admin: { token: string; user: User };
  default: { token: string; user: User };
  moderator: { token: string; user: User };
  moderator2: { token: string; user: User };
}
