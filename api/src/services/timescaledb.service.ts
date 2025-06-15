import { datasource } from "@db/timescaledb/timescaledb.datasource";
import DatabaseException, {
  DatabaseCountException,
  DatabaseLostConnectionException,
  DatabaseRefusedException,
  DatabaseTimeoutException,
} from "@utils/exceptions/database.exception";
import Logger from "@tightec/logger";

class TimescaleDBService {
  /**
   * Init timescaledb connection
   */
  static async initConnection(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      Logger.verbose("TimescaleDB create connection ...");

      datasource
        .initialize()
        .then(() => {
          Logger.info("TimescaleDB - connected successfully");
          resolve();
        })
        .catch((err) => {
          if (err.code == "PROTOCOL_CONNECTION_LOST") {
            reject(
              new DatabaseLostConnectionException(
                "TimescaleDB - lost connection",
                err
              )
            );
          } else if (err.code == "ER_CON_COUNT_ERROR") {
            reject(
              new DatabaseCountException(
                "TimescaleDB - has too many connections",
                err
              )
            );
          } else if (err.code == "ECONNREFUSED") {
            reject(
              new DatabaseRefusedException(
                "TimescaleDB - refused connection",
                err
              )
            );
          } else if (err.code == "ER_GET_CONNECTION_TIMEOUT") {
            reject(
              new DatabaseTimeoutException(
                "TimescaleDB - connection timed out",
                err
              )
            );
          } else {
            reject(
              new DatabaseException("TimescaleDB - " + err.toString(), err)
            );
          }
        });
    });
  }
}

export default TimescaleDBService;
