/* eslint-disable linebreak-style */
import { Datapoint } from "@schemas/datapoint.schema";
import Device from "@schemas/device.schema";
import Sensor, { SensorType } from "@schemas/sensor.schema";
import { AdminSensors, filterItems } from "@utils/admin";
import { Permission, SensorDataType } from "@utils/enums";
import { SensorResponseDto, CreateSensorDto,UpdateSensorDto } from "@validations/sensor.validation";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";
import { mqttService } from "@services/mqtt.service";

import { FindOptionsWhere, IsNull } from "typeorm";
import { DeviceService } from "./device.service";

export class SensorService {
  /**
   * Get all available sensor types
   * @returns SensorType
   */
  public static async getSensorTypes(): Promise<SensorType[]> {
    return await SensorType.find();
  }
  /**
   * Get sensors from user
   * @param options
   * @returns Sensors
   */
  public static async getSensors(options?: {
    userId?: number;
    pagination?: { skip?: number; take?: number };
    deviceId?: number;
    placeId?: number;
  }): Promise<Sensor[]> {
    let sensors;

    if (options?.userId != null) {
      sensors = await Sensor.find({
        where: [
          {
            device: {
              place: {
                id: options.placeId,
                placeAccess: { user: { id: options.userId } },
              },
            },
            deletedAt: IsNull(),
          },
          {
            projects: { projectAccess: { user: { id: options.userId } } },
            deletedAt: IsNull(),
          },
        ],
        relations: { sensorType: true },
        select: {
          id: true,
          name: true,
          alias: true,
          sensorType: { name: true },
        },
      });
      return []; 
    } else {
      if (options?.deviceId != null) {
        sensors = await Sensor.find({
          relations: { sensorType: true },
          where: { device: { id: options.deviceId }, deletedAt: IsNull() },
          select: {
            id: true,
            name: true,
            alias: true,
            sensorType: { name: true },
          },
        });
      } else {
        sensors = await Sensor.find({
          where: { deletedAt: IsNull() },
          relations: { sensorType: true },
          skip: options?.pagination?.skip ?? 0,
          take: options?.pagination?.take ?? 25,
          select: {
            id: true,
            name: true,
            alias: true,
            sensorType: { name: true },
          },
        });
      }

     return sensors;
    }
  }
   
  
  /**
   * Get all devices
   * @param options
   * @returns AdminDevices
   */
  public static async getAdminSensors(options?: {
    filter?: {
      name?: string;
      alias?: string;
      type?: string;
      libraryId?: string;
      deviceName?: string;
    };
    pagination?: { index?: number; take?: number };
    order?: { orderBy: string; ascending: boolean };
  }): Promise<SensorResponseDto[]> {
    const take = options?.pagination?.take ?? 25;
    const index = options?.pagination?.index ?? 0;
    const skip = take * index;

    let dbSensors = await Sensor.find({
      relations: {
        sensorType: true,
        device: true,
      },
    });

    if (options?.order != null) {
      dbSensors = this._sortAdminSensors(
        dbSensors,
        options.order.orderBy,
        options.order.ascending,
      );
    }

    const filter = options?.filter ?? null;
    const nameFilter =
      filter?.name != null && filter.name !== "" ? filter.name : null;
    const aliasFilter =
      filter?.alias != null && filter.alias !== "" ? filter.alias : null;
    const typeFilter =
      filter?.type != null && filter.type !== "" ? filter.type : null;
    const libraryIdFilter =
      filter?.libraryId != null && filter.libraryId !== ""
        ? filter.libraryId
        : null;
    const deviceNameFilter =
      filter?.deviceName != null && filter.deviceName !== ""
        ? filter.deviceName
        : null;

    let adminSensors: AdminSensors;
    if (
      nameFilter != null ||
      aliasFilter != null ||
      typeFilter != null ||
      libraryIdFilter != null ||
      deviceNameFilter != null
    ) {
      const filteredPlaces = filterItems(
        dbSensors,
        this._filterFunction(
          nameFilter,
          aliasFilter,
          typeFilter,
          libraryIdFilter,
          deviceNameFilter,
        ),
        skip,
        take,
      );
      adminSensors = <AdminSensors>{
        sensors: filteredPlaces.filteredItems,
        total: filteredPlaces.totalItemsFound,
      };
    } else if (skip <= dbSensors.length) {
      adminSensors = <AdminSensors>{
        sensors: dbSensors.slice(skip, skip + take),
        total: dbSensors.length,
      };
    } else {
      adminSensors = <AdminSensors>{
        sensors: <Sensor[]>[],
        total: 0,
      };
    }
    adminSensors.index = index;
    adminSensors.take = take;


    return adminSensors.sensors.map((sensor: Sensor) => 
    this.toResponseDto(sensor)
  );
  }

  /**
   * Search Sensors by name
   * @param searchString
   */
  public static async searchSensors(searchString: string): Promise<Sensor[]> {
    const dbSensorList = await Sensor.find();
    return dbSensorList
      .filter((x) =>
        x.name.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()),
      )
      .sort((a: Sensor, b: Sensor) => (a > b ? -1 : 1));
  }

  /**
   * Get sensor by id
   * @param sensorId
   * @returns Sensor
   */
  public static async getSensor(sensorId: number): Promise<Sensor> {
    //find sensor in db
    const sensor = await Sensor.findOne({
      where: {
        id: sensorId,
        deletedAt: IsNull(),
      },
      relations: { sensorType: true, device: true },
    });

    if (!sensor) {
      throw new NotFoundException(
        "Sensor with id '" + sensorId + "' not found",
      );
    }

    return sensor;
  }

  /**
   * Check if user has permissions of sensor
   * @param isPermission
   * @param shouldPermission
   */
  public static async checkUserPermission(
    sensorId: number,
    userId: number,
    minPermission: Permission,
  ): Promise<void> {
    let permissionList: Permission[] = [];

    switch (minPermission) {
      case Permission.Admin:
        permissionList = [Permission.Admin];
        break;
      case Permission.Write:
        permissionList = [Permission.Admin, Permission.Write];
        break;
      case Permission.Read:
        permissionList = [Permission.Admin, Permission.Write, Permission.Read];
        break;
    }

    const sensor = await Sensor.findOne({
      where: (
        permissionList.map((permission) => {
          return {
            id: sensorId,
            deletedAt: IsNull(),
            device: {
              deletedAt: IsNull(),
              place: {
                placeAccess: {
                  user: { id: userId },
                  permission: permission,
                },
              },
            },
          };
        }) as FindOptionsWhere<Sensor>[]
      ).concat(
        permissionList.map((permission) => {
          return {
            id: sensorId,
            deletedAt: IsNull(),
            projects: {
              projectAccess: { user: { id: userId }, permission: permission },
            },
          };
        }),
      ),
    });

    if (!sensor) {
      throw new ForbiddenException("Access to sensor forbidden");
    }
  }

  /**
   * Get sensorType from db or create a new one
   * @param sensorType
   * @returns SensorType
   */
  public static async getSensorType(
    sensorType: string,
    sensorDataType?: SensorDataType,
  ): Promise<SensorType> {
    let sensorTypeDb = await SensorType.findOneBy({ name: sensorType });

    if (!sensorTypeDb) {
      sensorTypeDb = new SensorType();
      sensorTypeDb.name = sensorType;
      sensorTypeDb.type = sensorDataType ?? SensorDataType.number;
      await sensorTypeDb.save();
    }

    return sensorTypeDb;
  }

  /**
   * Create new sensor in device
   * @param name
   * @param sensorType
   * @param deviceId
   * @param options
   */
 // Modified method signatures
// src/services/sensor.service.ts
public static async createSensor(data: CreateSensorDto): Promise<Sensor> {
  const device = await DeviceService.getDevice(data.deviceId);
  
  const sensor = new Sensor();
  sensor.name = data.name;
  sensor.alias = data.alias;          // Direct access
  sensor.libraryId = data.libraryId;  // Direct access
  sensor.device = device;
  sensor.sensorType = await this.getSensorType(
    data.sensorType,
    data.sensorDataType  // Direct access
  );

  await sensor.save();
  return sensor;
}


 public static async updateSensor(id: number, data: UpdateSensorDto): Promise<Sensor> {
    const sensor = await Sensor.findOneBy({ id });
    if (!sensor) {
      throw new NotFoundException("Sensor not found");
    }

    // Update fields from DTO
    if (data.name) sensor.name = data.name;
    if (data.sensorType) {
      sensor.sensorType = await this.getSensorType(data.sensorType);
    }

    // Save changes first
    const updatedSensor = await sensor.save();

    // Publish config update to physical device
    mqttService.publishCommand(
      id, // Ensure `id` is a number
      { // Pass the object directly (no JSON.stringify here)
        type: "CONFIG_UPDATE",
        data: {
          id: updatedSensor.id,
          name: updatedSensor.name,
          type: updatedSensor.sensorType,
          updatedAt: new Date().toISOString()
        }
      }
    );



    return updatedSensor;
  }


  /**
   * Delete sensor by id
   * @param sensorId
   */
  public static async deleteSensor(sensorId: number): Promise<boolean> {
    const count = await Datapoint.count({ where: { sensorId: sensorId } });
    if (count > 0) {
      throw new BadRequestException(
        "Can not delete sensor, when datapoints exist: " + count,
      );
    }

    const result = await Sensor.delete({ id: sensorId });

    return result.affected != null && result.affected > 0;
  }

  public static async getDeviceFromSensor(
    sensorId: number,
    withPlace: boolean = false,
  ): Promise<Device> {
    const device = await Device.findOne({
      where: { sensors: { id: sensorId } },
      relations: { place: withPlace },
    });

    if (!device) throw new NotFoundException("Sensor has no device");

    return device;
  }

  private static _sortAdminSensors(
    sensors: Sensor[],
    orderBy: string,
    ascending: boolean,
  ): Sensor[] {
    return sensors.sort((a: Sensor, b: Sensor) => {
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
        case "alias":
          propA = a.alias ?? "";
          propB = b.alias ?? "";
          break;
        case "type":
          propA =
            (typeof a.sensorType === "string"
              ? a.sensorType
              : a.sensorType.name) ?? "";
          propB =
            (typeof b.sensorType === "string"
              ? b.sensorType
              : b.sensorType.name) ?? "";
          break;
        case "libraryId":
          propA = a.libraryId ?? "";
          propB = b.libraryId ?? "";
          break;
        case "device":
          propA = a.device.name ?? "";
          propB = b.device.name ?? "";
          break;
      }
      if (ascending) return propA < propB ? -1 : 1;
      return propA > propB ? -1 : 1;
    });
  }

  private static toResponseDto(sensor: Sensor): SensorResponseDto {
  return {
    id: sensor.id,
    name: sensor.name,
    alias: sensor.alias,
    sensorType: sensor.sensorType.name, // ✅ Convert to string here
    libraryId: sensor.libraryId,
    deviceId: sensor.device.id
  };
}


 private static _filterFunction(
  name: string | null,
  alias: string | null,
  type: string | null,
  libraryId: string | null,
  deviceName: string | null,
): (sensor: Sensor) => boolean {
  const filterFns: ((sensor: Sensor) => boolean)[] = [];

  // Name filter (fixed to use sensor.name)
  if (name != null) {
    filterFns.push((sensor: Sensor) => {
      const searchTerm = name.toLowerCase();
      const sensorName = sensor.name.toLowerCase();
      return sensorName.includes(searchTerm);
    });
  }

  // Alias filter
  if (alias != null) {
    filterFns.push((sensor: Sensor) => {
      const searchTerm = alias.toLowerCase();
      const sensorAlias = sensor.alias?.toLowerCase() || '';
      return sensorAlias.includes(searchTerm);
    });
  }

  // Type filter (simplified and type-safe)
  if (type != null) {
    filterFns.push((sensor: Sensor) => {
      const searchTerm = type.toLowerCase();
      const typeName = sensor.sensorType?.name?.toLowerCase() || '';
      return typeName.includes(searchTerm);
    });
  }

  // Library ID filter
  if (libraryId != null) {
    filterFns.push((sensor: Sensor) => {
      const searchTerm = libraryId.toLowerCase();
      const sensorLibId = sensor.libraryId?.toLowerCase() || '';
      return sensorLibId.includes(searchTerm);
    });
  }

  // Device name filter
  if (deviceName != null) {
    filterFns.push((sensor: Sensor) => {
      const searchTerm = deviceName.toLowerCase();
      return sensor.device.name.toLowerCase().includes(searchTerm);
    });
  }
 
  return (sensor: Sensor) => filterFns.every(fn => fn(sensor));
}

}
