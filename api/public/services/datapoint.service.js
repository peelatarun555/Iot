"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatapointService = void 0;
const timescaledb_datasource_1 = require("@db/timescaledb/timescaledb.datasource");
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
class DatapointService {
    static async createDatapoint(timestamp, sensorId, value, valueString) {
        const datapoint = new datapoint_schema_1.Datapoint();
        datapoint.timestamp = timestamp;
        datapoint.value = value;
        datapoint.valueString = valueString;
        datapoint.sensorId = sensorId;
        try {
            await datapoint_schema_1.Datapoint.insert(datapoint);
        }
        catch (e) {
            throw new graphql_exception_1.BadRequestGraphException("Can not create datapoint: " + e);
        }
        return datapoint;
    }
    static async createDatapoints(devEui, datapoints, skipDuplicated = false) {
        const datapointsTmp = datapoints.map((datapoint) => {
            const dp = new datapoint_schema_1.Datapoint();
            dp.timestamp = datapoint.timestamp;
            dp.value = datapoint.value;
            dp.valueString = datapoint.valueString;
            dp.sensorId = datapoint.sensorId;
            return dp;
        });
        if (skipDuplicated) {
            const chunkSize = 1000;
            for (let i = 0; i < datapointsTmp.length; i += chunkSize) {
                const chunk = datapointsTmp.slice(i, i + chunkSize);
                await datapoint_schema_1.Datapoint.createQueryBuilder()
                    .insert()
                    .into(datapoint_schema_1.Datapoint)
                    .values(chunk)
                    .orIgnore("('sensorId', 'timestamp') DO NOTHING")
                    .execute();
            }
            return datapointsTmp;
        }
        const chunkSize = 1000;
        for (let i = 0; i < datapointsTmp.length; i += chunkSize) {
            const chunk = datapointsTmp.slice(i, i + chunkSize);
            await datapoint_schema_1.Datapoint.insert(chunk);
        }
        const sensorIdCounts = datapointsTmp.reduce((acc, dp) => {
            acc[dp.sensorId] = (acc[dp.sensorId] || 0) + 1;
            return acc;
        }, {});
        logger_1.default.info(`Inserted: ${datapointsTmp.length} datapoints, devEui: ${devEui}, sensorId counts: ${JSON.stringify(sensorIdCounts)}`);
        return datapointsTmp;
    }
    static async updateDatapoint(timestamp, sensorId, value, valueString) {
        const datapoint = await datapoint_schema_1.Datapoint.findOneBy({
            sensorId: sensorId,
            timestamp: timestamp,
        });
        if (!datapoint) {
            throw new graphql_exception_1.NotFoundGraphException("Datapoint with sensorId " +
                sensorId +
                " and timestamp " +
                timestamp.toISOString() +
                " does not exist");
        }
        datapoint.value = value;
        datapoint.valueString = valueString;
        await datapoint.save();
        return datapoint;
    }
    static async deleteDatapoint(timestamp, sensorId) {
        const result = await datapoint_schema_1.Datapoint.delete({
            timestamp: timestamp,
            sensorId: sensorId,
        });
        return result.affected != null && result.affected > 0;
    }
    static async deleteDatapointsSensor(sensorId) {
        const result = await datapoint_schema_1.Datapoint.delete({ sensorId: sensorId });
        return result.affected != null && result.affected > 0;
    }
    static async deleteDatapointsTime(timestampBegin, timestampEnd, sensorId) {
        const result = await datapoint_schema_1.Datapoint.createQueryBuilder()
            .delete()
            .from(datapoint_schema_1.Datapoint)
            .andWhere("timestamp >= :timestampBegin", {
            timestampBegin: timestampBegin,
        })
            .andWhere("timestamp <  :timestampEnd", { timestampEnd: timestampEnd })
            .andWhere("sensor_id = :sensor", { sensor: sensorId })
            .execute();
        return result.affected != null ? result.affected : 0;
    }
    static async getDatapoint(sensorId, timestamp) {
        const datapoint = await datapoint_schema_1.Datapoint.findOneBy({
            sensorId: sensorId,
            timestamp: timestamp,
        });
        if (!datapoint) {
            throw new graphql_exception_1.NotFoundGraphException("Datapoint with sensorId " +
                sensorId +
                " and timestamp " +
                timestamp.toISOString() +
                " does not exist");
        }
        return datapoint;
    }
    static async getDatapoints(options) {
        const data = await timescaledb_datasource_1.datasource.query(`
      SELECT time_bucket('${options.options?.binSize ?? 15} ${options.options?.timeGroupSettings ?? enums_1.TimeGroupSettings.minute}', timestamp) AS bucket, AVG(value) as avg_value 
      FROM datapoints
      WHERE "sensor_id" = ${options.sensorId} 
      AND timestamp > '${options.options?.from?.toISOString() ??
            new Date(new Date().getTime() - 1000 * 3600 * 24 * 7).toISOString()}'
      AND timestamp < '${options.options?.to?.toISOString() ?? "NOW()"}'
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT ${options.pagination?.take ?? 500} OFFSET ${options.pagination?.skip ?? 0}; 
    `);
        return data.map((d) => new datapoint_schema_1.Datapoint({
            timestamp: new Date(d.bucket),
            sensorId: options.sensorId,
            value: d.avg_value,
        }));
    }
    static async getLastDatapoints(sensorId, n) {
        const data = await timescaledb_datasource_1.datasource.query(`
      SELECT value, timestamp
      FROM datapoints
      WHERE "sensor_id" = ${sensorId} 
      AND timestamp > '${new Date(new Date().getTime() - 1000 * 60 * n).toISOString()}'
      ORDER BY timestamp DESC;
    `);
        return data.map((d) => new datapoint_schema_1.Datapoint({
            sensorId,
            timestamp: d.timestamp,
            value: d.value,
        }));
    }
}
exports.DatapointService = DatapointService;
