import "reflect-metadata";

import superRequest from "supertest";
import app from "../../../server";
import { cleanTimescaleDb } from "./db.helper";

/**
 * Make a graphql request
 * @param query
 * @param authUser
 * @returns Request
 */
export const gRequest = (query: string, authUser?: { token: string }) => {
  const request = superRequest(app.express)
    .post("/v1/graphql")
    .send({ query: query });

  if (authUser != null) {
    request.set("authorization", "Bearer " + authUser.token);
  }
  return request;
};

/**
 * Make a graphql request with success checker
 * @param query
 * @param authUser
 * @returns
 */
export const gRequestSuccess = (query: string, authUser?: { token: string }) =>
  gRequest(query, authUser).expect(200);

/**
 * Wait for clean up dbs and app has started
 */
export async function initTest(): Promise<void> {
  await new Promise<void>((resolve) => {
    if (app.isRunning) {
      resolve();
    }
    app.express.on("init-complete", () => {
      resolve();
    });
  });

  await cleanTimescaleDb();
}
