"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const timescaledb_datasource_1 = require("@db/timescaledb/timescaledb.datasource");
const database_exception_1 = __importStar(require("@utils/exceptions/database.exception"));
const logger_1 = __importDefault(require("@tightec/logger"));
class TimescaleDBService {
    static async initConnection() {
        return await new Promise((resolve, reject) => {
            logger_1.default.verbose("TimescaleDB create connection ...");
            timescaledb_datasource_1.datasource
                .initialize()
                .then(() => {
                logger_1.default.info("TimescaleDB - connected successfully");
                resolve();
            })
                .catch((err) => {
                if (err.code == "PROTOCOL_CONNECTION_LOST") {
                    reject(new database_exception_1.DatabaseLostConnectionException("TimescaleDB - lost connection", err));
                }
                else if (err.code == "ER_CON_COUNT_ERROR") {
                    reject(new database_exception_1.DatabaseCountException("TimescaleDB - has too many connections", err));
                }
                else if (err.code == "ECONNREFUSED") {
                    reject(new database_exception_1.DatabaseRefusedException("TimescaleDB - refused connection", err));
                }
                else if (err.code == "ER_GET_CONNECTION_TIMEOUT") {
                    reject(new database_exception_1.DatabaseTimeoutException("TimescaleDB - connection timed out", err));
                }
                else {
                    reject(new database_exception_1.default("TimescaleDB - " + err.toString(), err));
                }
            });
        });
    }
}
exports.default = TimescaleDBService;
