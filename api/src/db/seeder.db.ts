import { User } from "@schemas/user.schema";
import { DatapointService } from "@services/datapoint.service";
import { DeviceService } from "@services/device.service";
import PlaceService from "@services/place.service";
import { UserService } from "@services/user.service";
import Logger from "@tightec/logger";
import { DeviceStatus, Role } from "@utils/enums";

class DbSeeder {
  public static async init() {
    if (await User.findOneBy({ email: "admin@admin.com" })) {
      return;
    }

    Logger.info("Seed db data ...");

    await UserService.createUser("admin@admin.com", "admin", "admin", {
      role: Role.Admin,
      password: "password",
    });

    const place = await PlaceService.createPlace("Testplace");

      const device = await DeviceService.createDevice({
      name: "Testdevice",
      devEui: "testdevice",
      deviceType: "testtype",
      status: DeviceStatus.production,
      placeId: place.id,
      options: {
        sensors: [
          { name: "Testsensor", sensorType: "temperature" }
        ]
      }
    });

    await DatapointService.createDatapoint(
      new Date(),
      device.sensors[0].id,
      12
    );
  }
}

export default DbSeeder;
