import { hasPermissionAccess } from "@middlewares/auth.middleware";
import { Datapoint } from "@schemas/datapoint.schema";
import Device, { DeviceType } from "@schemas/device.schema";
import Place, { PlaceAccess } from "@schemas/place.schema";
import Sensor from "@schemas/sensor.schema";
import Logger from "@tightec/logger";
import { DeviceStatus, Permission } from "@utils/enums";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";
//import { BadRequestException } from "@utils/exceptions/http.exception";
import {CreateDeviceDto, DeviceSensorDto ,UpdateDeviceDto  } from "@validations/device.validation";
import { IsNull, LessThan, Not } from "typeorm";
import ChirpstackService from "./chirpstack.service";
import PlaceService from "./place.service";
import { SensorService } from "./sensor.service";

 // Add 'devices' property to the interface
interface AdminDeviceItemDto {
  id: number;
  name: string;
  devEui: string;
  description?: string;
  status: DeviceStatus;
  deviceType: string;
  placeName: string;
}

interface AdminDeviceDto {
  devices: AdminDeviceItemDto[];
  total: number;
  index?: number;
  take?: number;
}



export class DeviceService {
  /**
   * Get all available device types
   * @returns DeviceType
   */
  public static async getDeviceTypes(): Promise<DeviceType[]> {
    return await DeviceType.find();
  }

  /**
   * Get devices from user
   * @param options
   * @returns Devices
   */
    public static async getDevices(options?: {
      userId?: number;
      pagination?: { skip?: number; take?: number };
      placeId?: number;
      deleted?: boolean;
    }): Promise<Array<{
      id: number;
      name: string;
      devEui: string;
      status: DeviceStatus;
      deviceType: string; // Now returns string instead of DeviceType entity
    }>> { // Changed return type
      let devices: Device[];

    if (options?.deleted) {
      devices = await Device.find({
        where: { deletedAt: Not(IsNull()) },
        skip: options?.pagination?.skip ?? 0,
        take: options?.pagination?.take ?? 25,
        relations: { deviceType: true },
      });
    } else if (options?.userId != null) {
      const placeAccess = await PlaceAccess.find({
        where: { user: { id: options.userId } },
        relations: { place: { devices: { deviceType: true } } },
        skip: options?.pagination?.skip ?? 0,
        take: options?.pagination?.take ?? 25,
      });

      const devicesPerPlace = placeAccess.map((p) => p.place.devices);

      devices = [];
      for (const row of devicesPerPlace)
        for (const device of row) devices.push(device);
    } else {
      if (options?.placeId != null) {
        devices = await Device.find({
          where: { place: { id: options.placeId }, deletedAt: IsNull() },
          relations: { deviceType: true },
        });
      } else {
        devices = await Device.find({
          where: { deletedAt: IsNull() },
          skip: options?.pagination?.skip ?? 0,
          take: options?.pagination?.take ?? 25,
          relations: { deviceType: true },
        });
      }
    }

    return devices.map((device) => ({
      id: device.id,
      name: device.name,
      devEui: device.devEui,
      status: device.status,
      deviceType: device.deviceType.name // ✅ Correct: entity → string
    }));

  }

  /**
   * Get all devices
   * @param options
   * @returns AdminDevices
   */
 

public static async getAdminDevices(options?: {
  filter?: {
    name?: string;
    eui?: string;
    description?: string;
    type?: string;
    placeName?: string;
  };
  pagination?: { index?: number; take?: number };
  order?: { orderBy: string; ascending: boolean };
}): Promise<AdminDeviceDto> {
  const take = options?.pagination?.take ?? 25;
  const index = options?.pagination?.index ?? 0;
  const skip = take * index; 

  // Get full entity with relations
  let dbDevices = await Device.find({
    relations: {
      deviceType: true,
      place: true,
    },
  });

  // Apply sorting if needed
  if (options?.order) {
    dbDevices = this._sortAdminDevices(
      dbDevices,
      options.order.orderBy,
      options.order.ascending
    );
  }

  // Convert to DTOs early
    let devices: AdminDeviceItemDto[] = dbDevices.map(device => ({
      id: device.id,
      name: device.name,
      devEui: device.devEui,
      description: device.description,
      status: device.status,
      deviceType: device.deviceType.name,
      placeName: device.place.name
    }));


  // Apply filtering
  if (options?.filter) {
    const { name, eui, description, type, placeName } = options.filter;
    devices = devices.filter(device => {
      const matchesName = name ? device.name.includes(name) : true;
      const matchesEui = eui ? device.devEui.includes(eui) : true;
      const matchesDesc = description ? device.description?.includes(description) : true;
      const matchesType = type ? device.deviceType.includes(type) : true;
      const matchesPlace = placeName ? device.placeName.includes(placeName) : true;
      return matchesName && matchesEui && matchesDesc && matchesType && matchesPlace;
    });
  }

  // Paginate results
  const paginatedDevices = devices.slice(skip, skip + take);

      return {
      devices: paginatedDevices,
      total: devices.length,
      index,
      take
    };

}

  /**
   * Search Devices by name
   * @param options 
   */
  public static async searchDevices(options: {
    userId?: number;
    searchString: string;
  }): Promise<Device[]> {
    let devices: Device[];

    if (options?.userId != null) {
      const placeAccess = await PlaceAccess.find({
        where: { user: { id: options.userId } },
        relations: { place: { devices: { deviceType: true } } },
      });

      const devicesPerPlace = placeAccess.map((p) => p.place.devices);
      devices = devicesPerPlace
        .map((devices) =>
          devices.filter((x) =>
            x.name
              .toLocaleLowerCase()
              .includes(options.searchString.toLocaleLowerCase())
          )
        )
        .reduce((a: Device[], b: Device[]) => a.concat(b));
    } else {
      const dbDeviceList = await Device.find();
      devices = dbDeviceList
        .filter((x) =>
          x.name
            .toLocaleLowerCase()
            .includes(options.searchString.toLocaleLowerCase())
        )
        .sort((a: Device, b: Device) => (a > b ? -1 : 1));
    }

    return this.sortDevices(devices);
  }

  /**
   * Get device by id
   * @param deviceId
   * @returns Device
   */
 // CORRECTED METHODS
public static async getDeviceByDevEui(devEui: string): Promise<Device> {
  const device = await Device.findOne({
    where: { devEui: devEui.toUpperCase(), deletedAt: IsNull() },
    relations: { deviceType: true }, // Already includes the entity
  });

  if (!device) throw new NotFoundException(`Device ${devEui} not found`);
  
  return device; // Return the entity directly
}

public static async getDevice(deviceId: number): Promise<Device> {
  const device = await Device.findOne({
    where: { id: deviceId },
    relations: { deviceType: true }, // Already includes the entity
  });

  if (!device) throw new NotFoundException(`Device ${deviceId} not found`);
  
  return device; // Return the entity directly
}

  /**
   * Create device in chirpstack if not exist
   * @param device
   */
  public static async createDeviceChirpStack(device: Device): Promise<void> {
    const chirpService = ChirpstackService.instance;

    try {
      const chirpDevice = await chirpService.getDevice(device.devEui);
      if (chirpDevice != null) return;
    } catch {
      // Not found error is expected
      return;
    }

    await chirpService.createDevice(device);
  }

  /**
   * Crate a new device
   * @param name
   * @param devEui
   * @param deviceType
   * @param status
   * @param placeId
   * @param options
   * @returns Device
   */
     public static async createDevice(
  data: CreateDeviceDto & {
    options?: {
      description?: string;
      createdAt?: Date;
      sensors?: DeviceSensorDto[];
    };
  }
): Promise<Device> {
  // Destructure the DTO
  const {
    name,
    devEui,
    deviceType,
    status,
    placeId,
    options
  } = data;

  // Existing checks remain the same
  const place = await Place.findOne({
    where: { id: placeId },
    select: { id: true },
  });

  if (!place) {
    throw new NotFoundException("Place does not exist!");
  }

  const deviceDb = await Device.findOne({
    where: { devEui: devEui.toUpperCase() },
    select: { id: true, deletedAt: true },
  });

  if (deviceDb) {
    if (deviceDb.deletedAt != null) {
      throw new BadRequestException(
        `Device with devEui ${devEui} already exists in soft delete`
      );
    } else {
      throw new BadRequestException(
        `Device with devEui ${devEui} already exists`
      );
    }
  }

  // Create device from DTO
  const device = new Device();
  device.createdAt = options?.createdAt ?? new Date();
  device.description = options?.description;
  device.status = status;
  device.devEui = devEui.toUpperCase();
  device.name = name;
  device.place = place;
  device.deviceType = await this.getDeviceType(deviceType);

  // Handle sensors
  for (const s of options?.sensors ?? []) {
    const sensor = new Sensor();
    sensor.name = s.name;
    sensor.alias = s.alias;
    sensor.device = device;
    sensor.sensorType = await SensorService.getSensorType(s.sensorType);
    device.sensors.push(sensor);
  }

  await device.save();
  return device;
}

  /**
   * Get deviceType from db or create a new one
   * @param deviceType
   * @returns DevicType
   */
 // In DeviceService class
   private static async getDeviceType(typeName: string): Promise<DeviceType> {
  const deviceType = await DeviceType.findOne({ where: { name: typeName } });
  
  if (!deviceType) {
    throw new NotFoundException(`Device type '${typeName}' not found`);
  }
  
  return deviceType;
  }


  /**
   * Update device by id
   * @param deviceId
   * @returns Device
   */
  public static async updateDevice(
  deviceId: number,
  userId?: number,
  
  options?: UpdateDeviceDto 
  
): Promise<Device> {
  const device = await Device.findOne({
    where: { id: deviceId, deletedAt: IsNull() },
    relations: { deviceType: true },
  });

  if (!device) {
    throw new NotFoundException(`Device with id ${deviceId} does not exist`);
  }

  if (!options) return device;

  // Handle updates
  if (options.createdAt != null) device.createdAt = options.createdAt;
  if (options.description != null) device.description = options.description;
  if (options.status != null) device.status = options.status;

  if (options.devEui != null) {
    const existingDevice = await Device.findOne({
      where: { id: Not(deviceId), devEui: options.devEui.toUpperCase() },
      select: { id: true, deletedAt: true },
    });

    if (existingDevice) {
      const errorMsg = existingDevice.deletedAt 
        ? `Device with devEui ${options.devEui} exists in soft delete`
        : `Device with devEui ${options.devEui} already exists`;
      throw new BadRequestException(errorMsg);
    }
    device.devEui = options.devEui.toUpperCase();
  }

  if (options.name != null) device.name = options.name;

  if (options.placeId != null) {
    if (userId) {
      await PlaceService.checkUserPermission(
        options.placeId,
        userId,
        Permission.Write
      );
    }

    const place = await Place.findOneBy({ id: options.placeId });
    if (!place) throw new NotFoundException("Place does not exist");
    device.place = place;
  }

  if (options.deviceType) {
    device.deviceType = await this.getDeviceType(options.deviceType); // ✅ Correct
  }

  await device.save();

  // Reload to get updated relations
  const updatedDevice = await Device.findOne({
    where: { id: deviceId },
    relations: { deviceType: true },
  });

  return updatedDevice!; // ✅ Correct type
}


  /**
   * Delete device by id
   * @param deviceId
   * @returns boolean
   */
  public static async deleteDevice(deviceId: number): Promise<boolean> {
    const result = await Device.delete({ id: deviceId });

    return result.affected != null && result.affected > 0;
  }

  /**
   * Delete devices permanently
   */
  public static async permanentlyDeleteDevices(): Promise<void> {
    const fourWeeksAgo = new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000);
    const result = await Device.delete({ deletedAt: LessThan(fourWeeksAgo) });

    if (result.affected != null && result.affected > 0)
      Logger.info("Deleted devices permanently: " + result.affected);
  }

  /**
   * Undo a soft delete
   * @param deviceId
   */
  public static async undoSoftDeleteDevice(deviceId: number): Promise<Device> {
    const device = await Device.findOne({
      where: { id: deviceId, deletedAt: Not(IsNull()) },
      relations: { sensors: true, place: true },
    });

    if (!device) {
      throw new NotFoundException(
        "Device is not available for undo soft delete"
      );
    }

    for (let i = 0; i < device.sensors.length; i++) {
      device.sensors[i].deletedAt = null;
    }

    const oldPlaceId =
      device.description != null
        ? Number(device.description.split("placeId:")[1])
        : null;

    if (oldPlaceId == null) {
      throw new Error("No old place id provided.");
    }

    const oldPlace = await Place.findOneBy({ id: oldPlaceId });

    if (oldPlace) {
      device.place = oldPlace;
    }

    device.deletedAt = null;
    await device.save();

    return device;
  }

  /**
   * Delete device by id
   * @param deviceId
   * @returns boolean
   */
  public static async softDeleteDevice(deviceId: number): Promise<boolean> {
    const device = await Device.findOne({
      where: { id: deviceId, deletedAt: IsNull() },
      relations: { sensors: true, place: true },
    });

    if (!device) {
      throw new NotFoundException("Device not found");
    }

    let place = await Place.findOneBy({ name: "Limbo" });
    if (!place) {
      place = await PlaceService.createPlace("Limbo");
    }

    const currentDate = new Date();

    device.description = device.description + " - placeId:" + device.place.id;
    device.place = place;
    device.deletedAt = currentDate;
    device.sensors = device.sensors.map((s) => {
      s.deletedAt = currentDate;
      return s;
    });

    await device.save();

    return true;
  }

  /**
   * Hard delete device by id
   * @param deviceId
   * @returns boolean
   */
  public static async hardDeleteDevice(deviceId: number): Promise<boolean> {
    const device = await Device.findOne({
      where: { id: deviceId, deletedAt: Not(IsNull()) },
      relations: { sensors: true, place: true },
    });

    if (!device) {
      throw new NotFoundException("Device not found or not deleted");
    }

    let count = 0;
    for (const sensor of device.sensors) {
      count += await Datapoint.count({ where: { sensorId: sensor.id } });
    }

    if (count > 0) {
      throw new BadRequestException(
        "Can not delete device, when " + count + " datapoints for sensors exist"
      );
    }

    await Device.delete({ id: deviceId });

    return true;
  }

  /**
   * Get place from device
   * @param deviceId
   * @returns Place
   */
  public static async getPlaceFromDevice(deviceId: number): Promise<Place> {
    const place = await Place.findOne({ where: { devices: { id: deviceId } } });

    if (!place) throw new NotFoundException("Device has no place");

    return place;
  }

  /**
   * Check if user has permissions of device
   * @param isPermission
   * @param shouldPermission
   */
  public static async checkUserPermission(
    deviceId: number,
    userId: number,
    minPermission: Permission
  ): Promise<void> {
    const placeAccess = await PlaceAccess.findOne({
      where: {
        user: { id: userId },
        place: { devices: { id: deviceId, deletedAt: IsNull() } },
      },
    });

    if (!placeAccess) {
      throw new ForbiddenException("Access to device forbidden");
    }

    if (!hasPermissionAccess(placeAccess.permission, minPermission)) {
      throw new ForbiddenException("Access to device forbidden");
    }
  }

  public static sortDevices(devices: Device[]) {
    return devices.sort((a: Device, b: Device) => a.name.localeCompare(b.name));
  }

  private static _sortAdminDevices(
    devices: Device[],
    orderBy: string,
    ascending: boolean
  ): Device[] {
    return devices.sort((a: Device, b: Device) => {
      let propA: string | number = 0;
      let propB: string | number = 0;
      switch (orderBy) {
        case "id":
          propA = a.id;
          propB = b.id;
          break;
        case "name":
          propA = a.name;
          propB = b.name;
          break;
        case "eui":
          propA = a.devEui ?? "";
          propB = b.devEui ?? "";
          break;
        case "description":
          propA = a.description ?? "";
          propB = b.description ?? "";
          break;
        case "type":
          propA =
            (typeof a.deviceType === "string"
              ? a.deviceType
              : a.deviceType.name) ?? "";
          propB =
            (typeof b.deviceType === "string"
              ? b.deviceType
              : b.deviceType.name) ?? "";
          break;
        case "place":
          propA = a.place.name ?? "";
          propB = b.place.name ?? "";
          break;
      }
      if (ascending) return propA < propB ? -1 : 1;
      return propA > propB ? -1 : 1;
    });
  }

  /*private static _filterFunction(
    name: string | null,
    eui: string | null,
    description: string | null,
    type: string | null,
    placeName: string | null
  ): (device: Device) => boolean {
    const filterFns: ((device: Device) => boolean)[] = [];
    if (name != null)
      filterFns.push((device: Device) =>
        device.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
      );
    if (eui != null)
      filterFns.push((device: Device) =>
        device.devEui.toLocaleLowerCase().includes(eui.toLocaleLowerCase())
      );
    if (description != null)
      filterFns.push((device: Device) =>
        (device.description ?? "")
          .toLocaleLowerCase()
          .includes(description.toLocaleLowerCase())
      );
    if (type != null)
      filterFns.push((device: Device) => {
        if (typeof device.deviceType === "string")
          return device.deviceType
            .toLocaleLowerCase()
            .includes(type.toLocaleLowerCase());
        return device.deviceType.name
          .toLocaleLowerCase()
          .includes(type.toLocaleLowerCase());
      });
    if (placeName != null)
      filterFns.push((device: Device) =>
        device.place.name
          .toLocaleLowerCase()
          .includes(placeName.toLocaleLowerCase())
      );

    return (device: Device) => {
      for (const filterFn of filterFns) {
        if (!filterFn(device)) return false;
      }
      return true;
    };
  }*/
}