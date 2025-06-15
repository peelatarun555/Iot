import { CronJob } from "cron";
import Logger from "@tightec/logger";
import { DeviceService } from "./device.service";

export default class CronService {
  constructor() {
    new CronJob(
      "5 0 0 * * *",
      () => {
        this.executeDayly();
      },
      null,
      true,
      undefined,
      undefined,
      true
    );
  }

  private async executeDayly() {
    Logger.verbose("Execute cron dayly");
    await DeviceService.permanentlyDeleteDevices();
  }
}
