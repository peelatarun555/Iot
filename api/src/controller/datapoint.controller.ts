// src/controllers/datapoint.controller.ts
import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "@middlewares/auth.middleware";
import validationMiddleware from "@middlewares/validation.middleware";
import { CreateDatapointDto, UpdateDatapointDto } from "@validations/datapoint.validation"; // Fixed DTO names
import { DatapointService } from "@services/datapoint.service"; // Fixed service name

const router = Router();

// POST /datapoints
router.post(
  "/",
  authenticateToken,
  validationMiddleware(CreateDatapointDto), // Use corrected DTO name
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sensorId, ...data } = req.body;
      const datapoint = await DatapointService.createDatapoint(sensorId, data);
      return res.status(201).json(datapoint);
    } catch (error) {
      return next(error);
    }
  }
);

// PUT /datapoints/:id
router.put(
  "/:sensorId/:timestamp",
  authenticateToken,
  validationMiddleware(UpdateDatapointDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sensorId = Number(req.params["sensorId"]);
      const timestamp = new Date(decodeURIComponent(req.params["timestamp"]));
      
      const updated = await DatapointService.updateDatapoint(
        sensorId,
        timestamp,
        req.body // Update data
      );
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  }
);


// ... rest of the controller remains the same with corrected service/DTO names

export default router;
