import express, { Application, Request, Response, json, urlencoded } from "express";
import http from "http";
import compression from "compression";
import cors from "cors";
import Logger from "@tightec/logger";

import DataController from "@controller/data.controller";
import LibrarySeeder from "@db/library_seeder.db";
import DbSeeder from "@db/seeder.db";

import placeController from "@controller/place.controller";
import deviceController from "@controller/device.controller";
import sensorController from "@controller/sensor.controller";
import authController from "@controller/auth.controller";
import projectController from "@controller/project.controller";
import datapointController from "@controller/datapoint.controller";


import errorMiddleware from "@middlewares/error.middleware";
import authMiddleware from "@middlewares/auth.middleware";

import { env, isDevEnv } from "@utils/env";
import { NotFoundException } from "@utils/exceptions/http.exception";
import TimescaleDBService from "@services/timescaledb.service";
import CronService from "@services/cron.service";
import { UserService } from "@services/user.service";
import { Role } from "@utils/enums";

class App {
  public express: Application;
  public server: http.Server;
  public isRunning = false;

  constructor() {
    this.express = express();
    this.server = http.createServer(this.express);
    this.mountRoutes();
  }

  private mountRoutes(): void {
    this.express.get("/", (_req: Request, res: Response) => {
      res.send("Welcome to the REST API!");
    });

     this.express.use("/auth", authController);

    this.express.get("/health", (_req: Request, res: Response) => {
      res.send("OK");
    });
  }

  private async init(): Promise<void> {
    Logger.configure({ logLevel: env.LOG_LEVEL });

    this.initialiseMiddleware();
    Logger.verbose("Database init ...");
    await this.initialiseDatabases();
    this.initialiseController();
    this.catchNotFound();
    this.initialiseErrorHandling();
    new CronService();

    Logger.verbose("Express init complete");

    try {
      if (isDevEnv()) await DbSeeder.init();
    } catch (err) {
      Logger.error("Error while initializing DbSeeder: " + err);
    }

    try {
      await LibrarySeeder.seed();
    } catch (err: any) {
      Logger.error("Error while seeding library place: " + err);
    }

    await this.initAdminByEnv();

    this.express.emit("init-complete");
    this.isRunning = true;
  }

  private initialiseMiddleware(): void {
    this.express.use(cors());
    this.express.use(json({ limit: "100kb", strict: true }));
    this.express.use(urlencoded({ extended: false, parameterLimit: 500 }));
    this.express.use(compression());
  }

  private initialiseController(): void {
    // Apply auth to all /v1 routes
    this.express.use("/v1", authMiddleware.authenticateToken, new DataController().router);
    this.express.use("/api/places", placeController);
     this.express.use("/api/devices", deviceController);
     this.express.use("/api/sensors", sensorController);
     this.express.use("/api/projects", projectController);
     this.express.use("/api/datapoints", datapointController);

  }

  private catchNotFound(): void {
    this.express.use((_req, _res, next) => {
      next(new NotFoundException("Path not found!"));
    });
  }

  private initialiseErrorHandling(): void {
    this.express.use(errorMiddleware);
  }

  private async initialiseDatabases(tries = 0): Promise<void> {
    try {
      await TimescaleDBService.initConnection();
    } catch (err) {
      if (tries > 5) {
        Logger.error("Error while initializing TimescaleDBService: " + err);
        throw err;
      } else {
        Logger.warn(`Retrying TimescaleDBService in 5s [attempt ${tries + 1}]`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return await this.initialiseDatabases(tries + 1);
      }
    }
  }

  private async initAdminByEnv(): Promise<void> {
    if (env.SUPER_USER === "notset" || env.SUPER_PASSWORD === "notset") return;
    try {
      await UserService.getUserByEmail(env.SUPER_USER);
    } catch {
      await UserService.createUser(env.SUPER_USER, "admin", "admin", {
        role: Role.Admin,
        password: env.SUPER_PASSWORD,
      });
      Logger.info("Admin user " + env.SUPER_USER + " was created!");
    }
  }

  public listen(): void {
    this.express.on("init-complete", () => {
      this.server.listen(env.PORT, () => {
        Logger.info(`App running on port ${env.PORT} with NODE_ENV: ${env.NODE_ENV}`);
      });
    });

    this.init();
  }
}

export default new App();
