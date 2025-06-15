import { Datapoint } from "@schemas/datapoint.schema";
import Sensor from "@schemas/sensor.schema";
import { DatapointService } from "@services/datapoint.service";
import Logger from "@tightec/logger";
import { TimeGroupSettings } from "@utils/enums";
import { IsNull, Not } from "typeorm";
import { LibrarySeatDto, SeatState } from "../models";

export default class LibraryService {
  public static async getInitialStates(): Promise<LibrarySeatDto[]> {
    const sensors = await Sensor.find({
      where: { libraryId: Not(IsNull()) },
      select: { id: true, libraryId: true },
      relations: { device: true },
    });

    const payload: LibrarySeatDto[] = [];
    for (const sensor of sensors) {
      const datapoints = await DatapointService.getLastDatapoints(sensor.id, 6);
      payload.push({
        libraryId: sensor.libraryId!,
        seatState: this.getSeatState(datapoints),
        devEui: sensor.device.devEui,
      });
    }

    return payload;
  }

  /**
   * Triggered on new datapoint to refresh library state (for example: save it or call external system).
   */
  public static async onDatapointChange(
    sensorId: number,
    newDatapoint: Datapoint | null = null,
  ): Promise<void> {
    try {
      const sensor = await Sensor.findOne({
        where: { id: sensorId },
        select: { id: true, libraryId: true },
        relations: { device: true },
      });

      if (!sensor?.libraryId) return;

      const datapoints = await DatapointService.getDatapoints({
        sensorId: sensorId,
        options: {
          timeGroupSettings: TimeGroupSettings.minute,
          binSize: 1,
          from: new Date(Date.now() - 1000 * 60 * 10),
        },
      });

      if (newDatapoint) {
        datapoints.push(newDatapoint);
      }

      const payload: LibrarySeatDto = {
        libraryId: sensor.libraryId,
        seatState: this.getSeatState(datapoints),
        devEui: sensor.device.devEui,
      };

      this.notifyClient(payload);
    } catch (err) {
      Logger.error("Error while updating library state: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  private static notifyClient(payload: LibrarySeatDto) {
    Logger.info("Library seat state updated: " + JSON.stringify(payload));
    // Alternatively: send update to external service or store in DB
  }

  private static getSeatState(datapoints: Datapoint[]): SeatState {
    if (datapoints.length === 0) return SeatState.UNKNOWN;
    if (datapoints.length <= 3) return SeatState.IN_BETWEEN;

    const avg = datapoints.reduce((acc, curr) => {
      if (curr.value == null) return acc;
      return acc + curr.value / datapoints.length;
    }, 0);

    return avg < 30 ? SeatState.FREE : SeatState.OCCUPIED;
  }
}
