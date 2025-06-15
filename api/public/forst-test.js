"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: "../.env" });
const frostRequestHandler_1 = __importDefault(require("./utils/frostRequestHandler"));
async function runTest() {
    const frost = new frostRequestHandler_1.default();
    try {
        const response = await frost.getRequest("Things?$top=1");
        console.log("✅ Connection successful. Sample data:");
        console.dir(response.data, { depth: null });
    }
    catch (error) {
        console.error("❌ FROST server test failed:", error.message);
    }
}
runTest();
