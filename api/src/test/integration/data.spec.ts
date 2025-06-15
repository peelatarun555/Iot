import "reflect-metadata";

import app from "../../server";

import superRequest from "supertest";

import { Datasource } from "@schemas/datasource.schema";
import Place from "@schemas/place.schema";
import { DatasourceService } from "@services/datasource.service";
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { DeviceStatus } from "@utils/enums";
import { describe } from "mocha";
import { initTest } from "./helper/server.helper";

describe("Test data controller", () => {
  let datasource: Datasource;
  let place: Place;

  before(async () => {
    await initTest();
    datasource = await DatasourceService.createDatasource("Endpoints test");
    place = await PlaceService.createPlace("Place");
  });

  it("TTN: No api Key was provided, should not be able to access", async () => {
    await superRequest(app.express).post("/v1/data/ttn").expect(401);
  });

  it("TTN: Wrong api Key was provided, should not be able to access", async () => {
    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", "aljshdljhgkjghlkhlhgkhjkjashdkjlas")
      .expect(401);
  });

  it("TTN: Should not be able to access if validation failed", async () => {
    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({})
      .expect(422);
  });

  it("TTN: Should not be able to insert data, device does not exist", async () => {
    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({
        end_device_ids: {
          dev_eui: "shjdgfliakjGDFHJSDF",
          device_id: "ASLDSKDJFHSDKJF",
        },
        uplink_message: {
          frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
          decoded_payload: {
            battery: "4.58",
            co2: "474.526",
            humidity: "42.83",
            temperature: "30.67",
          },
          settings: { time: new Date() },
        },
      })
      .expect(400);
  });

  it("TTN: Should be able to insert data, device does exist", async () => {
    const device = await DeviceService.createDevice(
      "Device",
      "shjdgfliakjGDFHJSDFkzgiu",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          {
            name: "battery",
            sensorType: "battery",
          },
          {
            name: "humidity",
            sensorType: "humidity",
          },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({
        end_device_ids: {
          dev_eui: device.devEui,
          device_id: "ASLDSKDJFHSDKJF",
        },
        uplink_message: {
          frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
          decoded_payload: {
            battery: "4.58",
            co2: "474.526",
            humidity: "42.83",
            temperature: "30.67",
          },
          settings: { time: new Date() },
        },
      })
      .expect(200);
  });

  it("TTN: Should insert data with existing rssi sensor", async () => {
    const deviceWithRssi = await DeviceService.createDevice(
      "Device with RSSI",
      "shjdgflasdiakjsGDFHJSDFlll",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          { name: "battery", sensorType: "battery" },
          { name: "humidity", sensorType: "humidity" },
          { name: "rssi", sensorType: "rssi" },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({
        end_device_ids: {
          dev_eui: deviceWithRssi.devEui,
          device_id: "ASLDSKDJFHSDKJF",
        },
        uplink_message: {
          frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
          decoded_payload: { battery: "4.58", humidity: "42.83" },
          settings: { time: new Date() },
          rx_metadata: [{ rssi: -85 }], // Simulate RSSI data
        },
      })
      .expect(200);
  });

  it("TTN: Should create rssi sensor if not exists, but type does", async () => {
    const deviceWithRssi = await DeviceService.createDevice(
      "Device with RSSI",
      "shjdgfliaasdkasjsGDFHJSDFdddd",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          { name: "battery", sensorType: "battery" },
          { name: "humidity", sensorType: "humidity" },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({
        end_device_ids: {
          dev_eui: deviceWithRssi.devEui,
          device_id: "ASLDSKDJFHSDKJF",
        },
        uplink_message: {
          frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
          decoded_payload: { battery: "4.58", humidity: "42.83" },
          settings: { time: new Date() },
          rx_metadata: [{ rssi: -85 }], // Simulate RSSI data
        },
      })
      .expect(200);
  });

  it("TTN: Should not insert data if data with identical timestamp already exists for device", async () => {
    const timestamp = new Date();

    const device = await DeviceService.createDevice(
      "Device",
      "shjdsgflia6kjGDFHJSDFkziutf",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          {
            name: "battery",
            sensorType: "battery",
          },
          {
            name: "humidity",
            sensorType: "humidity",
          },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({
        end_device_ids: {
          dev_eui: device.devEui,
          device_id: "ASLDSKDJFHSDKJF",
        },
        uplink_message: {
          frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
          decoded_payload: {
            battery: "4.58",
            humidity: "42.83",
          },
          settings: { time: timestamp },
        },
      })
      .expect(200);

    await superRequest(app.express)
      .post("/v1/data/ttn")
      .set("api-key", datasource.token)
      .send({
        end_device_ids: {
          dev_eui: device.devEui,
          device_id: "ASLDSKDJFHSDKJF",
        },
        uplink_message: {
          frm_payload: "lknjsldkfjödflkjgdfölkjgölkdfg",
          decoded_payload: {
            battery: "4.58",
            humidity: "42.83",
          },
          settings: { time: timestamp },
        },
      })
      .expect(400);
  });

  /**
   *
   * Chirpstack Tests
   *
   */

  it("Chirpstack: No api Key was provided, should not be able to access", async () => {
    await superRequest(app.express).post("/v1/data/chirp").expect(401);
  });

  it("Chirpstack: Wrong api Key was provided, should not be able to access", async () => {
    await superRequest(app.express)
      .post("/v1/data/chirp")
      .set("api-key", "aljshdljhgkjghlkhlhgkhjkjashdkjlas")
      .expect(401);
  });

  it("Chirpstack: Should not be able to access if validation failed", async () => {
    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({})
      .expect(422);
  });

  it("Chirpstack: Should not be able to insert data, device does not exist", async () => {
    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({
        time: new Date(),
        deviceInfo: {
          deviceName: "Device",
          devEui: "shjdsgflia6kjG676tJSDFnotexist",
        },
        object: {
          battery: "4.58",
          co2: "474.526",
          humidity: "42.83",
          temperature: "30.67",
        },
      })
      .expect(400);
  });

  it("Chirpstack: Should be able to insert data, device does exist", async () => {
    const device = await DeviceService.createDevice(
      "Device",
      "shjdsgflia6kjGDFHJSDFfdziuhiu",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          {
            name: "battery",
            sensorType: "battery",
          },
          {
            name: "humidity",
            sensorType: "humidity",
          },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({
        time: new Date(),
        deviceInfo: {
          deviceName: device.name,
          devEui: device.devEui,
        },
        object: {
          battery: "4.58",
          humidity: "42.83",
        },
      })
      .expect(200);
  });

  it("Chirpstack: Should insert data with existing rssi sensor", async () => {
    const deviceWithRssi = await DeviceService.createDevice(
      "Device with RSSI",
      "shjdgflasdiakjsGDFHJSDFrteszrz",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          { name: "battery", sensorType: "battery" },
          { name: "humidity", sensorType: "humidity" },
          { name: "rssi", sensorType: "rssi" },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({
        time: new Date(),
        deviceInfo: {
          deviceName: deviceWithRssi.name,
          devEui: deviceWithRssi.devEui,
        },
        object: {
          battery: "4.58",
          humidity: "42.83",
        },
        rxInfo: [
          {
            rssi: -85,
          },
        ],
      })
      .expect(200);
  });

  it("Chirpstack: Should create rssi sensor if not exists, but type does", async () => {
    const deviceWithRssi = await DeviceService.createDevice(
      "Device with RSSI",
      "shjdgfliaasdkasjsGDihfdfd",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          { name: "battery", sensorType: "battery" },
          { name: "humidity", sensorType: "humidity" },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({
        time: new Date(),
        deviceInfo: {
          deviceName: deviceWithRssi.name,
          devEui: deviceWithRssi.devEui,
        },
        object: {
          battery: "4.58",
          humidity: "42.83",
        },
        rxInfo: [
          {
            rssi: -85,
          },
        ],
      })
      .expect(200);
  });

  it("Chirpstack: Should not insert data if data with identical timestamp already exists for device", async () => {
    const timestamp = new Date();

    const device = await DeviceService.createDevice(
      "Device",
      "shjdsgflia6kjGDFHJSDF",
      "devicetype",
      DeviceStatus.development,
      place.id,
      {
        sensors: [
          {
            name: "battery",
            sensorType: "battery",
          },
          {
            name: "humidity",
            sensorType: "humidity",
          },
        ],
      },
    );

    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({
        time: timestamp,
        deviceInfo: {
          deviceName: device.name,
          devEui: device.devEui,
        },
        object: {
          battery: "4.58",
          humidity: "42.83",
        },
      })
      .expect(200);

    await superRequest(app.express)
      .post("/v1/data/chirp?event=up")
      .set("api-key", datasource.token)
      .send({
        time: timestamp,
        deviceInfo: {
          deviceName: device.name,
          devEui: device.devEui,
        },
        object: {
          battery: "4.58",
          humidity: "42.83",
        },
      })
      .expect(400);
  });

  it("Chirpstack: Should return 200 for status event (different than up)", async () => {
    await superRequest(app.express)
      .post("/v1/data/chirp?event=join")
      .set("api-key", datasource.token)
      .send({})
      .expect(200);
  });
});
