import { authenticateToken } from "@middlewares/auth.middleware";
import { errorHandleAsyncMiddleware } from "@middlewares/error.middleware";
import validationMiddleware from "@middlewares/validation.middleware";
import { Datapoint } from "@schemas/datapoint.schema";
import Device from "@schemas/device.schema";
import Sensor, { SensorType } from "@schemas/sensor.schema";
import { DataService } from "@services/data.service";
import { DatapointService } from "@services/datapoint.service";
import LibraryService from "@services/library.service";
import Logger from "@tightec/logger";
import { SensorDataType } from "@utils/enums";
import { env } from "@utils/env";
import { 
  TtnInsertDataDto,
  ChirpInsertDataDto,
  IVInsertData,
  IVInsertChirpUpData 
} from "@validations/data.validation";
import { NextFunction, Request, Response, Router } from "express";
import Joi from "joi";
import { IsNull } from "typeorm";
import Controller from "./controller";

export default class DataController implements Controller {
  public path = "/data";
  public router = Router();

  private lastTTNPingTimestamp: number = 0;
  private lastChirpstackPingTimestamp: number = 0;

  constructor() {
     this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Fixed middleware usage
        this.router.post(
      `${this.path}/chirp`,
      authenticateToken,
      this.chirpstackEventTypeChecker,
      validationMiddleware(ChirpInsertDataDto), 
      errorHandleAsyncMiddleware(this.insertChirpData)
    );


          this.router.post(
        `${this.path}/chirp`,
        authenticateToken,
        validationMiddleware(TtnInsertDataDto), 
        errorHandleAsyncMiddleware(this.insertChirpData) 
      ); 
    }
  private chirpstackEventTypeChecker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (req.query["event"] === "up") {
      return next();
    }
    res.status(200).send({
      message: "Event type not supported",
    });
  }

  private async sendStatusPing(baseUrl: string, isTTN = true): Promise<void> {
    if (baseUrl === "") {
      return;
    }

    const now = Date.now();
    const THIRTY_SECONDS = 30000;

    if (isTTN) {
      if (
        this.lastTTNPingTimestamp != 0 &&
        now - this.lastTTNPingTimestamp < THIRTY_SECONDS
      ) {
        Logger.debug(
          "Ping skipped: last ping was sent less than 30 seconds ago.",
        );
        return;
      }
      this.lastTTNPingTimestamp = now;
    } else {
      if (
        this.lastChirpstackPingTimestamp != 0 &&
        now - this.lastChirpstackPingTimestamp < THIRTY_SECONDS
      ) {
        Logger.debug(
          "Ping skipped: last ping was sent less than 30 seconds ago.",
        );
        return;
      }
    }

    const status = "up";
    const msg = "OK";

    // You can customize the ping value as needed. Here, we're using the current timestamp.
    const pingValue = new Date().toISOString();

    const pingUrl = `${baseUrl}?status=${encodeURIComponent(status)}&msg=${encodeURIComponent(msg)}&ping=${encodeURIComponent(pingValue)}`;

    try {
      const response = await fetch(pingUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Ping failed with status: ${response.status} - ${response.statusText}`,
        );
      }

      Logger.verbose(`Ping sent successfully: ${pingUrl}`);
    } catch (error) {
      Logger.error(`Error sending ping: ${error}`);
    }
  }

  /**
   * Insert data from Chirpstack
   */
  public async insertChirpData(
    req: Request,
    res: Response,
  ): Promise<Response | void> {
    const { time, deviceInfo, object, rxInfo }: IVInsertChirpUpData = req.body;

    Logger.info(
      "Message received from chirpstack: " +
        deviceInfo.deviceName +
        " devEui: " +
        deviceInfo.devEui.toUpperCase(),
    );

    const device = await Device.findOne({
      where: { devEui: deviceInfo.devEui.toUpperCase(), deletedAt: IsNull() },
      select: { id: true, devEui: true, sensors: { id: true, name: true } },
      relations: { sensors: { sensorType: true } },
    });

    if (!device) {
      return res
        .status(400)
        .send({ message: "Device is not registered in db" });
    }

    const datapoints: {
      timestamp: Date;
      value?: number;
      valueString?: string;
      sensorId: number;
    }[] = [];

    //validate sensors
    for (const sensor of device.sensors) {
      const value = object[sensor.name];

      if (value == null) {
        continue;
      }

      try {
        const datapoint = this._createDatapoint(sensor, time, value);
        datapoints.push(datapoint);
      } catch (err: any) {
        return res.status(400).send({
          message:
            "Sensor " + sensor.name + " has validation errors: " + err.details,
        });
      }
    }

    if (rxInfo && rxInfo.length > 0) {
      const rssi = rxInfo.map((rx) => rx.rssi).reduce((a, b) => (a + b) / 2);
      datapoints.push(await DataService.handleRssiData(device, rssi));
    }

    try {
      await DatapointService.createDatapoints(device.devEui, datapoints, false);
    } catch (err: any) {
      if (err.code == "23505") {
        return res.status(400).send({
          message: "Data already exists",
        });
      }
      Logger.error("Error while creating datapoints: " + err);
      return res.status(500).send({
        message: err,
      });
    }

    this.sendStatusPing(env.CHIRPSTACK_PING_STATUS_URL, false);

    res.status(200).send({
      message: "Successfull created datapoints",
    });
  }

  public async insertTTNData(req: Request, res: Response): Promise<Response | void> {
  const { end_device_ids, uplink_message }: IVInsertData = req.body;

  const device = await Device.findOne({
    where: {
      devEui: end_device_ids.dev_eui.toUpperCase(),
      deletedAt: IsNull(),
    },
    relations: { sensors: { sensorType: true } }, // Correct relations
    select: {
      id: true,
      devEui: true,
      sensors: { // Nested under sensors
        id: true,
        name: true,
        sensorType: { // Correct nested selection
          id: true,
          type: true // Match your SensorType entity
        }
      }
    }
  });

    if (!device) {
      return res
        .status(400)
        .send({ message: "Device is not registered in db" });
    }

    const datapoints: {
      timestamp: Date;
      value?: number;
      valueString?: string;
      sensorId: number;
    }[] = [];

    //validate sensors
    for (const sensor of device.sensors) {
      const value = uplink_message.decoded_payload[sensor.name];

      if (value == null) {
        continue;
      }

      try {
        const datapoint = this._createDatapoint(
          sensor,
          uplink_message.settings.time,
          value,
        );
        datapoints.push(datapoint);
        // Send websocket message for library updates
        // Library values are always numbers
        if (datapoint?.value != null)
          await LibraryService.onDatapointChange(sensor.id, datapoint);
      } catch (err: any) {
        return res.status(400).send({
          message:
            "Sensor " + sensor.name + " has validation errors: " + err.details,
        });
      }
    }

    if (uplink_message.rx_metadata && uplink_message.rx_metadata.length > 0) {
      const rssi = uplink_message.rx_metadata
        .map((rx) => rx.rssi)
        .filter((rssi) => rssi != null)
        .reduce((a, b) => (a! + b!) / 2);
      datapoints.push(await DataService.handleRssiData(device, rssi));
    }

    try {
      await DatapointService.createDatapoints(device.devEui, datapoints, false);
    } catch (err: any) {
      if (err.code == "23505") {
        return res.status(400).send({
          message: "Data already exists",
        });
      }
      Logger.error("Error while creating datapoints: " + err);
      return res.status(500).send({
        message: err,
      });
    }

    this.sendStatusPing(env.TTN_PING_STATUS_URL, true);

    res.status(200).send({
      message: "Successfull created datapoints",
    });
  }

  private _createDatapoint(
    sensor: Sensor,
    timestamp: Date,
    value: number | string,
  ): Datapoint {
    const datapoint = <Datapoint>{
      sensorId: sensor.id,
      timestamp,
    };

    if ((sensor.sensorType as SensorType).type === SensorDataType.number) {
      Joi.number().validate(value);

      datapoint.value = Number(value);
    } else if (
      (sensor.sensorType as SensorType).type === SensorDataType.string
    ) {
      Joi.string().validate(value);
      datapoint.valueString = value.toString();

      datapoint.value = Number.isFinite(Number(value))
        ? Number(value)
        : undefined;
    }

    return datapoint;
  }
}
