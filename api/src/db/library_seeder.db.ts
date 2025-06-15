import Place from "@schemas/place.schema";
import Logger from "@tightec/logger";
import { DeviceService } from "@services/device.service";
import { DeviceStatus } from "@utils/enums";
import { env } from "@utils/env";
import { SensorService } from "@services/sensor.service";
import Device from "@schemas/device.schema";
import Sensor from "@schemas/sensor.schema";
import { DatapointService } from "@services/datapoint.service";
import { Like } from "typeorm";

export default class LibrarySeeder {
  public static async seed() {
    Logger.verbose("LibrarySeeder: Seeding library places");

    // Parent place
    const libraryResult = await Place.upsert(
      { name: "Library", openAccess: true },
      {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ["name"],
      },
    );
    const libraryPlace = await Place.findOneOrFail({
      where: { name: "Library" },
    });
    if (libraryResult.identifiers.length > 0) {
      Logger.verbose("LibrarySeeder: Created Library Place");
    }

    if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
      // Try 4 devices per floor - they go from
      const devices: Device[] = [];
      if (libraryPlace) {
        try {
          const numberOfDevices = 10;
          for (let i = 1; i <= numberOfDevices; i++) {
            devices.push(await this.createLibraryDevice(libraryPlace.id, i));
          }
        } catch (error: any) {
          Logger.error(
            "Library Seeder: Device already exists: " + error.message,
          );
          // Fetch devices with names matching a naming scheme
          const foundDevices = await Device.find({
            where: { name: Like("Library-Testdevice-%") },
          });
          devices.push(...foundDevices);
        }
      }

      const sensors: Sensor[] = [];
      let tableId = 6;
      try {
        for (const device of devices) {
          // Half the devices are for the ground floor, half for upper floor
          const floor = device.id % 2 == 0 ? "ground" : "upper";

          // Some devices only have one sensor
          if (device.id % 3 == 0) {
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId),
            );
          }
          // Some devices only have two sensor
          if (device.id % 3 == 1) {
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId, 1),
            );
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId, 2),
            );
          }
          // Some devices only have four sensor
          if (device.id % 3 == 2) {
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId, 1),
            );
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId, 2),
            );
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId, 3),
            );
            sensors.push(
              await this.createLibrarySensor(device.id, floor, tableId, 4),
            );
          }

          tableId++;
        }
      } catch (error: any) {
        Logger.error(
          "Library Seeder: Sensor already exists (likely caused by unique libraryId): " +
            error.message,
        );
        // Fetch devices with names matching a naming scheme
        const foundSensors = await Sensor.find({
          where: { name: Like("library-test-activity%") },
        });
        sensors.push(...foundSensors);

        for (const sensor of sensors) {
          // Delete current data points to keep number of created datapoints
          // in check (status depends on the last couple being similar in value)
          await DatapointService.deleteDatapointsSensor(sensor.id);
        }
      }

      const numberOfDatapoints = 60;
      const timeSpanForTestDataInMinutes = 60;

      for (const sensor of sensors) {
        // Half fixed data
        if (sensor.id % 2 == 0)
          await this.createFixedDataForLibrarySensor(
            sensor.id,
            timeSpanForTestDataInMinutes,
          );
        // Half random data
        if (sensor.id % 2 == 1)
          await this.createRandomDataForLibrarySensor(
            sensor.id,
            numberOfDatapoints,
            timeSpanForTestDataInMinutes,
          );
      }
    }
  }

  // Beta-Distribution - skewed towards 0 or 100
  private static randomBeta(alpha: number, beta: number): number {
    const u = Math.random();
    const v = Math.random();
    return (
      Math.pow(u, 1 / alpha) / (Math.pow(u, 1 / alpha) + Math.pow(v, 1 / beta))
    );
  }

  private static async createFixedDataForLibrarySensor(
    sensorId: number,
    timespan: number,
  ) {
    const now = new Date();

    // Random start value: 0 oder 100
    // We already get all % 2 sensors here
    let value = sensorId % 4 == 0 ? 0 : 100;

    // One every minute, so we iterate over the timespan, not number of points
    for (let i = 0; i < timespan; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 1000);

      await DatapointService.createDatapoint(timestamp, sensorId, value);

      if ((i + 1) % 10 === 0) {
        // Switch value every 10th datapoint
        value = value === 0 ? 100 : 0;
      }
    }
  }

  private static async createRandomDataForLibrarySensor(
    sensorId: number,
    numberDp: number,
    timespan: number,
  ) {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + timespan * 60 * 1000);

    for (let i = 0; i < numberDp; i++) {
      const randomTimestamp = new Date(
        inOneHour.getTime() +
          Math.random() * (now.getTime() - inOneHour.getTime()),
      );
      const weightedValue = this.randomBeta(0.5, 0.5) * 100; // Sensors range from 0 to 100

      await DatapointService.createDatapoint(
        randomTimestamp,
        sensorId,
        weightedValue,
      );
    }
  }

  private static async createLibrarySensor(
    deviceId: number,
    floor: string,
    id: number,
    subId: number | null = null,
  ) {
    const libraryId = subId
      ? `${floor}_seat_${id}_${subId}`
      : `${floor}_seat_${id}`;
        return await SensorService.createSensor({
      name: "library-test-activity",
      sensorType: "activity",
      deviceId: deviceId,
      libraryId: libraryId // ✅ Direct property
    });

  }

private static async createLibraryDevice(libraryPlaceId: number, id: number) {
  return DeviceService.createDevice({
    name: `Library-Testdevice-${id}`,
    devEui: `testdevice-${id}`,
    deviceType: "activity",
    status: DeviceStatus.development,
    placeId: libraryPlaceId
  });
}

}
//export default LibrarySeeder;
