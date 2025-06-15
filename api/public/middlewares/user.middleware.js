"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CurrentUser;
const type_graphql_1 = require("type-graphql");
function CurrentUser() {
    return (0, type_graphql_1.createParameterDecorator)(({ context }) => context.user);
}
