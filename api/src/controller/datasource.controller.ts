// src/controller/datasource.controller.ts
import { Router, Request, Response, NextFunction } from "express";
import { Datasource } from "@schemas/datasource.schema";
import { DatasourceService } from "@services/datasource.service";
import { Role } from "@utils/enums";
import {
  DatasourceCreateInput,
  DatasourceUpdateInput,
  DatasourceGetPaginationInput,
} from "@validations/datasource.validation";
import { validationMiddleware } from "@middlewares/validation.middleware";
import { authenticateToken, checkRole } from "@middlewares/auth.middleware";

class DatasourceController {
  public path = "/datasources";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /datasources (with pagination)
    this.router.get(
      this.path,
      authenticateToken,
      checkRole(Role.admin),
      validationMiddleware(DatasourceGetPaginationInput, "query"),
      this.getAllDatasources
    );

    // POST /datasources
    this.router.post(
      this.path,
      authenticateToken,
      checkRole(Role.admin),
      validationMiddleware(DatasourceCreateInput),
      this.createDatasource
    );

    // PUT /datasources/:id
    this.router.put(
      `${this.path}/:id`,
      authenticateToken,
      checkRole(Role.admin),
      validationMiddleware(DatasourceUpdateInput),
      this.updateDatasource
    );

    // DELETE /datasources/:id
    this.router.delete(
      `${this.path}/:id`,
      authenticateToken,
      checkRole(Role.admin),
      this.deleteDatasource
    );
  }

  private getAllDatasources = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await DatasourceService.getDatasources({
        pagination: req.query,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  private createDatasource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, ...options } = req.body;
      const result = await DatasourceService.createDatasource(name, options);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  private updateDatasource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await DatasourceService.updateDatasource(
        parseInt(req.params.id),
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  private deleteDatasource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const success = await DatasourceService.deleteDatasource(
        parseInt(req.params.id)
      );
      res.status(success ? 204 : 404).send();
    } catch (error) {
      next(error);
    }
  };
}

export default new DatasourceController();
