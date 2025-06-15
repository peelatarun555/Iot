import { DeviceServiceClient } from "@chirpstack/chirpstack-api/api/device_grpc_pb";
import device_pb, {
  DeviceListItem,
  Device as grpcDevice,
} from "@chirpstack/chirpstack-api/api/device_pb";
import { credentials, Metadata } from "@grpc/grpc-js";
import Device from "@schemas/device.schema";
import { env } from "@utils/env";

class ChirpstackService {
  private static _instance: ChirpstackService;
  private deviceServiceClient: DeviceServiceClient;
  private metadata: Metadata;

  public static get instance(): ChirpstackService {
    return this._instance || (this._instance = new this());
  }

  constructor() {
    this.deviceServiceClient = new DeviceServiceClient(
      env.CHIRPSTACK_API_URL,
      credentials.createInsecure()
    );
    this.metadata = new Metadata();
    this.metadata.set("authorization", "Bearer " + env.CHIRPSTACK_API_TOKEN);
  }

  public async getDevices(): Promise<Device[] | undefined> {
    const deviceListReq = new device_pb.ListDevicesRequest();
    return new Promise((resolve, reject) => {
      this.deviceServiceClient.list(
        deviceListReq,
        this.metadata,
        (err, res) => {
          if (err != null) {
            return reject(err);
          }
          if (res != undefined) {
            const devicesList = res
              .getResultList()
              .map(this.grpcDeviceToDevice);
            return resolve(devicesList);
          }
          reject("No devices found");
        }
      );
      return undefined;
    });
  }

  public async getDevice(devEui: string): Promise<Device | undefined> {
    const deviceReq = new device_pb.GetDeviceRequest();
    deviceReq.setDevEui(devEui);

    return new Promise((resolve, reject) => {
      this.deviceServiceClient.get(deviceReq, this.metadata, (err, resp) => {
        if (err != null) {
          return reject(err);
        }
        if (resp?.hasDevice()) {
          const dev = resp.getDevice();
          if (dev != undefined) return resolve(this.grpcDeviceToDevice(dev));
        }
        reject("No device found");
      });
      return undefined;
    });
  }

  public async createDevice(device: Device): Promise<void> {
    const createReq = new device_pb.CreateDeviceRequest();
    createReq.setDevice(this.deviceToGrpcDevice(device));

    return new Promise((resolve, reject) => {
      this.deviceServiceClient.create(createReq, this.metadata, (err) => {
        if (err != null) {
          return reject(err);
        }
        resolve();
      });
      return;
    });
  }

  /**
   *
   * @param inputDevice : Device Object from grpc library
   * returns the given grpc Device coverted to standard Device object from schemas
   */
  private grpcDeviceToDevice(inputDevice: grpcDevice | DeviceListItem): Device {
    const outputDev = new Device();
    outputDev.name = inputDevice.getName();
    outputDev.devEui = inputDevice.getDevEui();
    outputDev.description = inputDevice.getDescription();
    //TODO map device profile to device type
    return outputDev;
  }

  /**
   *
   * @param inputDevice : Device object from schemas/device.schema
   * returns the given Device coverted to a Device object from grpc librabry
   */
  private deviceToGrpcDevice(inputDevice: Device): grpcDevice {
    const outputDev = new grpcDevice();
    outputDev.setDevEui(inputDevice.devEui);
    outputDev.setName(inputDevice.name);
    outputDev.setJoinEui("0000000000000000");
    if (inputDevice.description !== undefined) {
      outputDev.setDescription(inputDevice.description);
    }
    //TODO map device profile to device type
    return outputDev;
  }
}

export default ChirpstackService;
