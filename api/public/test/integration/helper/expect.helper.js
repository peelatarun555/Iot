"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectData = exports.expectNotFoundRequest = exports.expectBadRequest = exports.expectUnauthorized = exports.expectForbidden = void 0;
require("reflect-metadata");
const chai_1 = require("chai");
const expectForbidden = (response) => {
    (0, chai_1.expect)(response.body.errors).to.have.length(1);
    (0, chai_1.expect)(response.body.errors[0].extensions.code).to.equal("FORBIDDEN");
    (0, chai_1.expect)(response.body.data).to.be.null;
};
exports.expectForbidden = expectForbidden;
const expectUnauthorized = (response) => {
    (0, chai_1.expect)(response.body.errors).to.have.length(1);
    (0, chai_1.expect)(response.body.errors[0].extensions.code).to.equal("UNAUTHORIZED");
    (0, chai_1.expect)(response.body.data).to.be.null;
};
exports.expectUnauthorized = expectUnauthorized;
const expectBadRequest = (response) => {
    (0, chai_1.expect)(response.body.errors).to.have.length(1);
    (0, chai_1.expect)(response.body.data).to.be.null;
};
exports.expectBadRequest = expectBadRequest;
const expectNotFoundRequest = (response) => {
    (0, chai_1.expect)(response.body.errors).to.have.length(1);
    (0, chai_1.expect)(response.body.data).to.be.null;
};
exports.expectNotFoundRequest = expectNotFoundRequest;
function compareObject(data, compareObj) {
    for (const key in compareObj) {
        if (typeof compareObj[key] === "object") {
            compareObject(data[key], compareObj[key]);
        }
        else {
            (0, chai_1.expect)(data[key]).to.equal(compareObj[key]);
        }
    }
}
const expectData = (response, compareObj) => {
    (0, chai_1.expect)(response.body.errors).to.be.undefined;
    (0, chai_1.expect)(response.body.error).to.be.undefined;
    (0, chai_1.expect)(response.body.data).to.be.not.null;
    if (compareObj != null)
        compareObject(response.body.data, compareObj);
    return response.body.data;
};
exports.expectData = expectData;
