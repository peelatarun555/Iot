import Logger from "@tightec/logger";
import { Buffer } from "buffer";
import { CronJob } from "cron";
import ModbusRTU from "modbus-serial";
import { JRPCPost_t, shellyHttpCall } from "./auth";
import { env, isDevEnv, isProductionEnv } from "./utils/env";

process.env.TZ = "Europe/Berlin";

const MAX_RETRIES = 5; // Maximum number of retry attempts
const INITIAL_BACKOFF = 1000; // Initial backoff delay in milliseconds (1 second)
const MAX_BACKOFF = 10000; // Maximum backoff delay in milliseconds (30 seconds)

class WeatherStationClient {
  private client: ModbusRTU;
  private retryCount: number;

  constructor() {
    this.client = new ModbusRTU();
    this.retryCount = 0;
  }

  // Method to send status ping
  private async sendStatusPing(ok = true, msg = "OK"): Promise<void> {
    if (env.PING_STATUS_URL === "") {
      return;
    }

    const baseUrl = env.PING_STATUS_URL;
    const status = ok ? "up" : "down";
    const pingValue = new Date().toISOString();

    const pingUrl = `${baseUrl}?status=${encodeURIComponent(
      status
    )}&msg=${encodeURIComponent(msg)}&ping=${encodeURIComponent(pingValue)}`;

    try {
      const response = await fetch(pingUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Ping failed with status: ${response.status} - ${response.statusText}`
        );
      }

      Logger.info(`Ping sent successfully: ${pingUrl}`);
    } catch (error) {
      Logger.error(`Error sending ping: ${error}`);
    }
  }

  // Method to map values to sensor names
  private mapValuesToNames(values: number[]): { [key: string]: number } {
    const names = [
      "currWindSpeed",
      "avrgWindSpeed",
      "currWindDirection",
      "avrgWindDirection",
      "currTemperature",
      "avrgTemperature",
      "currPressure",
      "avrgPressure",
      "currSolarRadiation",
      "avrgSolarRadiation",
      "currRelativeHumidity",
      "avrgRelativeHumidity",
      "currRainGauge",
      "avrgRainGauge",
    ];

    const result: { [key: string]: number } = {};

    for (let i = 0; i < names.length && i < values.length; i++) {
      result[names[i]] = values[i];
    }

    return result;
  }

  // Method to convert buffer to float array
  private bufferToBigEndianFloatArray(buffer: Buffer): number[] {
    if (buffer.length % 4 !== 0) {
      throw new Error(
        "Invalid buffer length. It should be a multiple of 4 bytes."
      );
    }

    const floatValues: number[] = [];

    for (let i = 0; i < buffer.length; i += 4) {
      const chunk = Buffer.from(buffer.buffer, buffer.byteOffset + i, 4);
      floatValues.push(chunk.readFloatBE(0));
    }

    return floatValues;
  }

  private async closeConnection(): Promise<void> {
    if (this.client.isOpen) {
      await new Promise<void>((resolve) => {
        this.client.close(() => {
          Logger.verbose("Modbus connection closed");
          resolve();
        });
      });
    }
  }

  // Method to connect to the Modbus server
  private async connect(): Promise<void> {
    this.closeConnection();

    this.client.setID(env.MBS_ID);
    this.client.setTimeout(5000);

    try {
      await this.client.connectTCP(env.MBS_HOST, { port: env.MBS_PORT });
      Logger.info(
        `Connected to weather station at ${env.MBS_HOST}:${env.MBS_PORT}`
      );
      this.retryCount = 0; // Reset retry count on successful connection
    } catch (error: any) {
      Logger.warn(
        `Failed to connect to weather station at ${env.MBS_HOST}:${env.MBS_PORT} - ${error.message}`
      );
      throw error;
    }
  }

  // Method to read data from Modbus
  private async readData(): Promise<{ [key: string]: number }> {
    try {
      const data = await this.client.readHoldingRegisters(1, 32);
      Logger.info("Data read from Modbus");
      Logger.debug(
        `Received data: ${data.buffer.toString("hex").toUpperCase()}`
      );

      const floatValues = this.bufferToBigEndianFloatArray(data.buffer);
      const mappedValues = this.mapValuesToNames(floatValues);

      Logger.debug("Mapped Values:" + JSON.stringify(mappedValues, null, 2));

      for (const [key, value] of Object.entries(mappedValues)) {
        if (isNaN(value)) {
          Logger.warn(
            `The float value ${key} is NaN, will not send data to API.`
          );
          throw new Error(`Invalid data for ${key}`);
        }
      }

      return mappedValues;
    } catch (error: any) {
      Logger.error("Error reading Modbus data: " + error.message);
      throw error;
    } finally {
      if (this.client.isOpen) {
        await this.closeConnection();
        Logger.verbose("Modbus connection closed");
      }
    }
  }

  // Method to send data to the endpoint
  private async sendDataToEndpoint(dataPayload: {
    [key: string]: number;
  }): Promise<void> {
    const now = new Date().toISOString();

    const data = {
      time: now,
      deviceInfo: {
        deviceName: env.DEVICE_ID,
        devEui: env.DEV_EUI,
      },
      object: dataPayload,
    };

    try {
      const response = await fetch(env.API_URL + "/v1/data/chirp?event=up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${response.statusText}`
        );
      }

      Logger.info(
        "Data sent to the endpoint: " +
          env.API_URL +
          "/v1/data/chirp" +
          " , data: " +
          JSON.stringify(data) +
          ", res: " +
          response.status
      );
    } catch (error) {
      Logger.error("Error sending data to the endpoint: " + error);
    }
  }

  // Method to toggle the Shelly device
  private async toggleShelly(toggleTo: boolean): Promise<number> {
    if (env.SHELLY_IP === "" || env.SHELLY_PASS === "") {
      Logger.debug(
        "Shelly IP or password not set, cannot toggle weather station"
      );
      return 0;
    }

    try {
      const password = env.SHELLY_PASS;
      const host = env.SHELLY_IP;
      const postData: JRPCPost_t = {
        id: 1,
        method: "Switch.Set",
        params: { id: 0, on: toggleTo },
      };

      Logger.warn(`Weather station turned ${toggleTo ? "on" : "off"}`);

      const data = await shellyHttpCall(postData, host, password);
      const response = JSON.parse(data);
      if (response.result && typeof response.result.was_on !== "undefined") {
        return response.result.was_on ? 1 : 2;
      } else {
        return 0;
      }
    } catch (error) {
      Logger.error(
        "Error sending data to the endpoint or processing the response: " +
          error
      );
      return 0;
    }
  }

  // Method to reset the weather station
  private async resetWeatherStation(): Promise<void> {
    const result = await this.toggleShelly(false);
    if (result === 1) {
      Logger.info(
        "Weather station was ON -> now OFF - will be switched on after delay"
      );
      setTimeout(async () => {
        await this.toggleShelly(true);
      }, 5000);
    } else if (result === 2) {
      Logger.info("Weather station was OFF - Will now be turned ON");
      await this.toggleShelly(true);
    } else {
      Logger.warn("Unable to toggle Shelly device");
    }
  }

  // Main method to perform the data retrieval and handling
  public async performDataRetrieval(): Promise<void> {
    try {
      await this.connect();
      const dataPayload = await this.readData();
      await this.sendStatusPing(true, "OK");
      await this.sendDataToEndpoint(dataPayload);
    } catch (error) {
      Logger.error("An error occurred during data retrieval: " + error);
      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        const backoffTime = Math.min(
          INITIAL_BACKOFF * 2 ** (this.retryCount - 1),
          MAX_BACKOFF
        );
        Logger.info(
          `Retrying data retrieval in ${
            backoffTime / 1000
          } seconds (Attempt ${this.retryCount}/${MAX_RETRIES})`
        );
        setTimeout(async () => {
          await this.performDataRetrieval();
        }, 5000);
      } else {
        Logger.error(
          `Max retry attempts (${MAX_RETRIES}) reached. Initiating resetWeatherStation.`
        );
        await this.sendStatusPing(false, "Data retrieval failed");
        this.retryCount = 0; // Reset for future attempts
        await this.resetWeatherStation();
      }
    }
  }
}

//==============================================================
Logger.configure({
  logLevel: env.LOG_LEVEL,
});

if (isProductionEnv() || isDevEnv()) {
  const cronString = `${env.SYNC_SECONDS} */5 * * * *`;

  Logger.info(
    "Starting cron job to read data from weather station, cron: " + cronString
  );

  const weatherStationClient = new WeatherStationClient();

  new CronJob(
    cronString,
    async function () {
      await weatherStationClient.performDataRetrieval();
    },
    null,
    true
  );
} else {
  Logger.error(
    "Not in production or development environment, not starting cron job"
  );
}
