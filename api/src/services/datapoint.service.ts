import { datasource } from "@db/timescaledb/timescaledb.datasource";
import { Datapoint } from "@schemas/datapoint.schema";
import Logger from "@tightec/logger";
import { TimeGroupSettings } from "@utils/enums";
import {UpdateDatapointDto } from "@validations/datapoint.validation"
import {
  BadRequestException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";

import { mqttService } from "@services/mqtt.service";
export class DatapointService {
  /**
   * Create single datapoint
   * @param timestamp
   * @param sensorId
   * @param value
   * @param valueString
   * @returns Datapoint
   */
  public static async createDatapoint(
  timestamp: Date,
  sensorId: number,
  value?: number,
  valueString?: string,
): Promise<Datapoint> {
  const datapoint = new Datapoint();
  datapoint.timestamp = timestamp;
  datapoint.value = value;
  datapoint.valueString = valueString;
  datapoint.sensorId = sensorId;

  try {
    const savedDatapoint = await datapoint.save();
    
    // Pass the object directly instead of JSON string
    mqttService.publishCommand(
      savedDatapoint.sensorId,
      { // <-- Remove JSON.stringify()
        action: "DATAPOINT_CREATED",
        data: savedDatapoint 
      }
    );

    return savedDatapoint;
  } catch (e) {
    throw new BadRequestException(
      `Failed to create datapoint: ${(e as Error).message}`
    );
  }
}


  /**
   * Create multiple datapoints
   * @param datapoints
   * @returns Datapoint[]
   */
  public static async createDatapoints(
    devEui: string,
    datapoints: {
      timestamp: Date;
      value?: number;
      valueString?: string;
      sensorId: number;
    }[],
    skipDuplicated = false,
  ): Promise<Datapoint[]> {
    const datapointsTmp = datapoints.map((datapoint) => {
      const dp = new Datapoint();
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

        await Datapoint.createQueryBuilder()
          .insert()
          .into(Datapoint)
          .values(chunk)
          .orIgnore("('sensorId', 'timestamp') DO NOTHING")
          .execute();
      }

      return datapointsTmp;
    }

    const chunkSize = 1000;
    for (let i = 0; i < datapointsTmp.length; i += chunkSize) {
      const chunk = datapointsTmp.slice(i, i + chunkSize);
      await Datapoint.insert(chunk);
    }

    const sensorIdCounts = datapointsTmp.reduce(
      (acc, dp) => {
        acc[dp.sensorId] = (acc[dp.sensorId] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    Logger.info(
      `Inserted: ${datapointsTmp.length} datapoints, devEui: ${devEui}, sensorId counts: ${JSON.stringify(sensorIdCounts)}`,
    );

    return datapointsTmp;
  }

  /**
   * Update single datapoint
   * @param sensorId
   * @param timestamp
   * @param value
   * @param valueString
   * @returns Datapoint
   */
  // src/services/datapoint.service.ts
      public static async updateDatapoint(
        sensorId: number,
        timestamp: Date,
        data: UpdateDatapointDto
      ): Promise<Datapoint> {
        const datapoint = await Datapoint.findOneBy({ sensorId, timestamp });
        if (!datapoint) throw new NotFoundException("Datapoint not found");

        // Update fields
        if (data.value !== undefined) datapoint.value = data.value;
        if (data.valueString !== undefined) datapoint.valueString = data.valueString;

        await datapoint.save();
        return datapoint;
      }


  /**
   * Delete single datapoint
   * @param sensorId
   * @param timestamp
   * @returns Boolean
   */
  public static async deleteDatapoint(
    timestamp: Date,
    sensorId: number,
  ): Promise<boolean> {
    const result = await Datapoint.delete({
      timestamp: timestamp,
      sensorId: sensorId,
    });

    return result.affected != null && result.affected > 0;
  }

  /**
   * Delete all sensor datapoints
   * @param sensorId
   * @returns Boolean
   */
  public static async deleteDatapointsSensor(
    sensorId: number,
  ): Promise<boolean> {
    const result = await Datapoint.delete({ sensorId: sensorId });

    return result.affected != null && result.affected > 0;
  }

  /**
   * Delete sensor datapoints between Dates
   * @param sensorId
   * @returns Boolean
   */
  public static async deleteDatapointsTime(
    timestampBegin: Date,
    timestampEnd: Date,
    sensorId: number,
  ): Promise<number> {
    const result = await Datapoint.createQueryBuilder()
      .delete()
      .from(Datapoint)
      .andWhere("timestamp >= :timestampBegin", {
        timestampBegin: timestampBegin,
      })
      .andWhere("timestamp <  :timestampEnd", { timestampEnd: timestampEnd })
      .andWhere("sensor_id = :sensor", { sensor: sensorId })
      .execute();
    return result.affected != null ? result.affected : 0;
  }

  /**
   * Get single datapoint
   * @param sensorId
   * @param timestamp
   * @returns Datapoint
   */
  public static async getDatapoint(
    sensorId: number,
    timestamp: Date,
  ): Promise<Datapoint> {
    const datapoint = await Datapoint.findOneBy({
      sensorId: sensorId,
      timestamp: timestamp,
    });

    if (!datapoint) {
      throw new NotFoundException(
        "Datapoint with sensorId " +
          sensorId +
          " and timestamp " +
          timestamp.toISOString() +
          " does not exist",
      );
    }

    return datapoint;
  }

  /**
   * Get single datapoint
   * @param options
   * @returns Datapoint[]
   */
  public static async getDatapoints(options: {
    sensorId: number;
    pagination?: { take?: number; skip?: number };
    options?: {
      from?: Date;
      to?: Date;
      timeGroupSettings?: TimeGroupSettings;
      binSize?: number;
    };
  }): Promise<Datapoint[]> {
    const data = await datasource.query(`
      SELECT time_bucket('${options.options?.binSize ?? 15} ${
        options.options?.timeGroupSettings ?? TimeGroupSettings.minute
      }', timestamp) AS bucket, AVG(value) as avg_value 
      FROM datapoints
      WHERE "sensor_id" = ${options.sensorId} 
      AND timestamp > '${
        options.options?.from?.toISOString() ??
        new Date(new Date().getTime() - 1000 * 3600 * 24 * 7).toISOString()
      }'
      AND timestamp < '${options.options?.to?.toISOString() ?? "NOW()"}'
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT ${options.pagination?.take ?? 500} OFFSET ${
        options.pagination?.skip ?? 0
      }; 
    `);

    return data.map(
      (d: any) =>
        new Datapoint({
          timestamp: new Date(d.bucket),
          sensorId: options.sensorId,
          value: d.avg_value,
        }),
    );
  }

  /**
   * Get a datapoints list for a certain sensor for the last n minutes
   * @param sensorId
   * @param n
   * @returns Promise<Datapoint[]>
   */
  public static async getLastDatapoints(
    sensorId: number,
    n: number,
  ): Promise<Datapoint[]> {
    const data = await datasource.query(`
      SELECT value, timestamp
      FROM datapoints
      WHERE "sensor_id" = ${sensorId} 
      AND timestamp > '${new Date(new Date().getTime() - 1000 * 60 * n).toISOString()}'
      ORDER BY timestamp DESC;
    `);

    return data.map(
      (d: any) =>
        new Datapoint({
          sensorId,
          timestamp: d.timestamp,
          value: d.value,
        }),
    );
  }
}
