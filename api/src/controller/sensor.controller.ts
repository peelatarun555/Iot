/* eslint-disable linebreak-style */
// src/controllers/sensor.controller.ts
import { Router, Request, Response, NextFunction } from "express";
import { SensorService } from "@services/sensor.service";
import { CreateSensorDto, UpdateSensorDto } from "@validations/sensor.validation";
import validationMiddleware from "@middlewares/validation.middleware";
import { authenticateToken } from "@middlewares/auth.middleware";

const router = Router();

// GET /api/sensors?name=...&type=...&deviceId=...&skip=...&take=...
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.query['name'] ? String(req.query['name']) : undefined;
    const type = req.query['type'] ? String(req.query['type']) : undefined;
    const deviceId = req.query['deviceId'] ? Number(req.query['deviceId']) : undefined;
    const skip = req.query['skip'] ? Number(req.query['skip']) : 0;
    const take = req.query['take'] ? Number(req.query['take']) : 25;

    const sensors = await SensorService.getSensors({
      deviceId,
      pagination: { skip, take }
    });

    // Apply additional filtering if needed
    const filtered = sensors.filter(sensor => {
      const matchesName = name
        ? sensor.name.toLowerCase().includes(name.toLowerCase())
        : true;
      const matchesType = type
        ? sensor.sensorType.name.toLowerCase() === type.toLowerCase()
        : true;
      return matchesName && matchesType;
    });

    return res.json(filtered);
  } catch (error) {
    return next(error);
  }
});

// GET /api/sensors/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sensorId = Number(req.params['id']);
    if (isNaN(sensorId)) {
      return res.status(400).json({ error: "Invalid sensor ID" });
    }

    const sensor = await SensorService.getSensor(sensorId);
    return sensor
      ? res.json(sensor)
      : res.status(404).json({ message: "Sensor not found" });
  } catch (error) {
    return next(error);
  }
});

// POST /api/sensors
router.post(
  "/",
  authenticateToken,
  validationMiddleware(CreateSensorDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sensor = await SensorService.createSensor(req.body);
      return res.status(201).location(`/api/sensors/${sensor['id']}`).json(sensor);
    } catch (error) {
      return next(error);
    }
  }
);

// PUT /api/sensors/:id
router.put(
  "/:id",
  authenticateToken,
  validationMiddleware(UpdateSensorDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sensorId = Number(req.params['id']);
      if (isNaN(sensorId)) {
        return res.status(400).json({ error: "Invalid sensor ID" });
      }

      const updated = await SensorService.updateSensor(sensorId, req.body);
      return updated
        ? res.json(updated)
        : res.status(404).json({ message: "Sensor not found" });
    } catch (error) {
      return next(error);
    }
  }
);

// DELETE /api/sensors/:id
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sensorId = Number(req.params['id']);
      if (isNaN(sensorId)) {
        return res.status(400).json({ error: "Invalid sensor ID" });
      }

      const deleted = await SensorService.deleteSensor(sensorId);
      return deleted
        ? res.status(204).send()
        : res.status(404).json({ message: "Sensor not found" });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
