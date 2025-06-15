"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const options = {
    host: "0.0.0.0/health",
    port: 3000,
    timeout: 2000,
};
const healthCheck = http_1.default.request(options, (res) => {
    console.log(`HEALTHCHECK STATUS: ${res.statusCode}`);
    if (res.statusCode == 200) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
});
healthCheck.on("error", function (err) {
    console.error("ERROR " + err);
    process.exit(1);
});
healthCheck.end();
