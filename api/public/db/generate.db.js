"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = __importDefault(require("path"));
module_alias_1.default.addAliases({
    "@resolvers": path_1.default.join(__dirname, "../", "resolvers"),
    "@validations": path_1.default.join(__dirname, "../", "validations"),
    "@utils": path_1.default.join(__dirname, "../", "utils"),
    "@middlewares": path_1.default.join(__dirname, "..", "middlewares"),
    "@services": path_1.default.join(__dirname, "..", "services"),
    "@schemas": path_1.default.join(__dirname, "..", "schemas"),
    "@controller": __dirname + "/controller",
});
