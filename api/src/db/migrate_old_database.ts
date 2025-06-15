/**
 * How to migrate from the old database:
 * - Delete timescaledb "helm uninstall -n development timescaledb"
 * - Create timescaledb pod "cd kubernetes/base/backend/timescaledb && sh install.sh"
 * - Connect to timescaledb "MASTERPOD="$(kubectl get pod -o name --namespace development -l release=timescaledb,role=master)" kubectl exec -i --tty --namespace development ${MASTERPOD} -- psql -U postgres"
 * - Delete database "DROP DATABASE eotlab;"
 * - Create database "CREATE DATABASE eotlab OWNER api;"
 * - Restart deployments "kubectl rollout restart deployment node-api -n development"
 *
 * - Create mariadb dump "sudo mysqldump --user root Database > dump_current.sql"
 * - Download dump via sftp
 *
 * - Run mariadb locally
 *  docker run -d \
 -p 3306:3306 \
 --name mariadb \
 -e MARIADB_ROOT_PASSWORD=password \
 -e MARIADB_DATABASE=eotlab \
 mariadb:latest
 *
 *
 * - Delete old database "eotlab" and recreate it "eotlab"
 * - Upload dump in local db "docker exec --interactive mariadbdump mariadb -u root eotlab -ppassword  < dump_current.sql"
 *
 * - Connect to timescaledb in kubernetes cluster "kubectl port-forward timescaledb-0 5432:5432 -n development"
 * - Execute migration: "cd backend/api && npm run migration:migrateold"
 */

import { Datapoint } from "@schemas/datapoint.schema";
import Device from "@schemas/device.schema";
import Place from "@schemas/place.schema";
import { DatapointService } from "@services/datapoint.service";
import { DeviceService } from "@services/device.service";
import TimescaleDBService from "@services/timescaledb.service";
import "dotenv/config";
import mariadb from "mariadb";
import moduleAlias from "module-alias";
import path from "path";
import "reflect-metadata";
// import TheThingsNetwotkService from "@services/ttn.service";
import Logger from "@tightec/logger";
import { DeviceStatus } from "@utils/enums";
import { IsNull } from "typeorm";

const fromimportDate: undefined | Date = undefined; // new Date("2023-08-10");

//register aliase
moduleAlias.addAliases({
  "@resolvers": path.join(__dirname, "../", "resolvers"),
  "@validations": path.join(__dirname, "../", "validations"),
  "@db": path.join(__dirname, "../", "db"),
  "@utils": path.join(__dirname, "../", "utils"),
  "@middlewares": path.join(__dirname, "..", "middlewares"),
  "@services": path.join(__dirname, "..", "services"),
  "@schemas": path.join(__dirname, "..", "schemas"),
  "@controller": __dirname + "/controller",
});

async function migrateToNewDatabase() {
  Logger.configure({ logLevel: "debug" });

  const connection = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "eotlab",
    port: 3306,
  });

  await TimescaleDBService.initConnection();

  //create places
  const devices = (await connection.query(
    "SELECT * FROM device;",
  )) as IOldDevice[];

  Logger.info("Found " + devices.length + " devices");

  // const ttnDevices = await TheThingsNetwotkService.getDevices();

  //check if devEuis do exist in ttn
  for (const device of devices) {
    if (device.name.length < 4) {
      device.name = "unikoblenz-pynode-" + device.name;
    }
    // if (!ttnDevices.find((d) => device.name == d.ids.device_id)) {
    //   const index = devices.indexOf(device);
    //   devices.splice(index, 1);

    //   Logger.warn(
    //     "Device from old db does not exist in TheThingsNetwork Console: " +
    //       device.name
    //   );
    // }
  }

  const measurementsLength = Number(
    (await connection.query("SELECT COUNT(time) as count FROM measurement"))[0]
      .count,
  );

  const dbDevices: { device: Device; oldDevice: IOldDevice }[] = [];

  for (let k = 0; k < devices.length; k++) {
    const device = devices[k];
    if (device.name.length == 2) {
      device.name = "unikoblenz-pynode-" + device.name;
    }

    const location = device.location;
    const builing = device.building;

    let buildingPlace = null;
    if (builing != null && builing != "") {
      buildingPlace = await Place.findOneBy({ name: builing.toUpperCase() });
      if (!buildingPlace) {
        buildingPlace = new Place();
        buildingPlace.name = builing.toUpperCase();
        Logger.info("Create place (building) - " + buildingPlace.name);
        await buildingPlace.save();
      }
    }

    let locationPlace = await Place.findOneBy({ name: location });
    if (!locationPlace) {
      locationPlace = new Place();
      locationPlace.name = location;
      if (buildingPlace) locationPlace.parent = buildingPlace;
      Logger.info("Create place - " + location);
      await locationPlace.save();
    }

    let deviceDevice = await Device.findOne({
      where: { name: device.name, deletedAt: IsNull() },
      relations: { sensors: true },
    });

    const sensors: IOldSensor[] = await connection.query(
      "SELECT id_sensor, description FROM sensor WHERE device_id = " +
        device.id_device +
        ";",
    );

    if (!deviceDevice) {
      // const ttnDevice = ttnDevices.find((d) => device.name == d.ids.device_id);

      //create devices and sensors
      deviceDevice = await DeviceService.createDevice(
        device.name,
        // ttnDevice?.ids.dev_eui ??
        "00000000000000" +
          device.name.substring(device.name.length - 2, device.name.length),
        "pynode",
        DeviceStatus.production,
        locationPlace.id,
        {
          sensors: sensors.map((s) => {
            return { name: s.description, sensorType: s.description };
          }),
        },
      );

      Logger.info("Create device - " + device.name);
    }

    dbDevices.push({ device: deviceDevice, oldDevice: device });
  }

  for (let k = 0; k < dbDevices.length; k++) {
    const device = dbDevices[k].oldDevice;
    const deviceDevice = dbDevices[k].device;

    await Promise.all(
      deviceDevice.sensors.map(async (sensor) => {
        const measurements: IOldMeasurement[] = await connection.query(
          fromimportDate != null
            ? `SELECT sensor_id, device_id, time, value, description
    FROM measurement
    INNER JOIN sensor
    ON measurement.sensor_id = sensor.id_sensor WHERE device_id = ${
      device.id_device
    } AND description = "${sensor.name}" AND time > '${fromimportDate
      .toISOString()
      .substring(0, 10)}'
    ORDER BY time;`
            : `SELECT sensor_id, device_id, time, value, description
        FROM measurement
        INNER JOIN sensor
        ON measurement.sensor_id = sensor.id_sensor WHERE device_id = ${device.id_device} AND description = "${sensor.name}"
        ORDER BY time;`,
        );

        if (measurements.length == 0) {
          Logger.info(
            "No measurements from sensor " +
              sensor.name +
              " - device " +
              deviceDevice.name +
              (fromimportDate != null
                ? " after " + fromimportDate.toISOString().substring(0, 10)
                : ""),
          );
          return;
        }

        Logger.info(
          "Got measurements from device: " +
            device.name +
            " - sensor: " +
            sensor.name,
        );

        await DatapointService.createDatapoints(
          deviceDevice.devEui,
          measurements.map((m) => {
            return {
              timestamp: new Date(m.time.getTime() + 1000 * 3600 * 2),
              value: m.value,
              sensorId: sensor.id,
            };
          }),
          true,
        );

        const measurementsCount = Number(await Datapoint.count());

        Logger.info(
          "Insert measurements " +
            device.name +
            " - m: " +
            measurements.length +
            " - d: " +
            (k + 1) +
            " / " +
            devices.length +
            " - p: " +
            Math.round((measurementsCount * 10000) / measurementsLength) / 100 +
            "%",
        );
      }),
    );
  }

  Logger.info("Migration finished");
  process.exit();
}

interface IOldDevice {
  id_device: number;
  name: string;
  location: string;
  building: string;
}

interface IOldSensor {
  id_sensor: number;
  description: string;
}

interface IOldMeasurement {
  sensor_id: number;
  device_id: number;
  time: Date;
  value: number;
  description: string;
}

migrateToNewDatabase();
