import "reflect-metadata";

import { expect } from "chai";
import { Response } from "supertest";

export const expectForbidden = (response: Response) => {
  expect(response.body.errors).to.have.length(1);
  expect(response.body.errors[0].extensions.code).to.equal("FORBIDDEN");
  expect(response.body.data).to.be.null;
};

export const expectUnauthorized = (response: Response) => {
  expect(response.body.errors).to.have.length(1);
  expect(response.body.errors[0].extensions.code).to.equal("UNAUTHORIZED");
  expect(response.body.data).to.be.null;
};

export const expectBadRequest = (response: Response) => {
  expect(response.body.errors).to.have.length(1);
  expect(response.body.data).to.be.null;
};

export const expectNotFoundRequest = (response: Response) => {
  expect(response.body.errors).to.have.length(1);
  expect(response.body.data).to.be.null;
};

function compareObject(
  data: { [key: string]: any },
  compareObj: { [key: string]: any }
): void {
  for (const key in compareObj) {
    if (typeof compareObj[key] === "object") {
      compareObject(data[key], compareObj[key]);
    } else {
      expect(data[key]).to.equal(compareObj[key]);
    }
  }
}

export const expectData = (
  response: Response,
  compareObj?: { [key: string]: any }
): { [key: string]: any } => {
  expect(response.body.errors).to.be.undefined;
  expect(response.body.error).to.be.undefined;
  expect(response.body.data).to.be.not.null;

  if (compareObj != null) compareObject(response.body.data, compareObj);

  return response.body.data;
};
