"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const module_alias_1 = __importDefault(require("module-alias"));
require("reflect-metadata");
module_alias_1.default.addAliases({
    "@resolvers": __dirname + "/resolvers",
    "@validations": __dirname + "/validations",
    "@utils": __dirname + "/utils",
    "@middlewares": __dirname + "/middlewares",
    "@services": __dirname + "/services",
    "@schemas": __dirname + "/schemas",
    "@db": __dirname + "/db",
    "@controller": __dirname + "/controller",
});
const app_1 = __importDefault(require("./app"));
process.env.TZ = "Europe/Berlin";
app_1.default.listen();
exports.default = app_1.default;
