import Device from "@schemas/device.schema";
import Sensor, { SensorType } from "@schemas/sensor.schema";
import Logger from "@tightec/logger";
import { SensorDataType } from "@utils/enums";

export class DataService {
  public static async handleRssiData(
    device: Device,
    rssi: number
  ): Promise<{
    timestamp: Date;
    value?: number;
    valueString?: string;
    sensorId: number;
  }> {
    let sensor = device.sensors.find((s) => s.name === "rssi");

    if (sensor == null) {
      Logger.info(
        "Device " +
          device.devEui +
          " has no sensor with name rssi, creating a new one"
      );

      let sensorType = await SensorType.findOne({
        where: { name: "rssi", type: SensorDataType.number },
      });

      if (!sensorType) {
        sensorType = await SensorType.create({
          name: "rssi",
          type: SensorDataType.number,
        }).save();
      }

      sensor = await Sensor.create({
        name: "rssi",
        sensorType: sensorType,
        device: device,
      }).save();
    }

    return {
      timestamp: new Date(),
      value: rssi,
      sensorId: sensor.id,
    };
  }
}
