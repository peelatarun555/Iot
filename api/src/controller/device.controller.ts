// src/controllers/device.controller.ts
import { Router, Request, Response, NextFunction } from "express";
import {DeviceService} from "@services/device.service";
import { CreateDeviceDto, UpdateDeviceDto } from "@validations/device.validation";
import validationMiddleware from "@middlewares/validation.middleware";
import { authenticateToken } from "@middlewares/auth.middleware";

const router = Router();

// GET /devices?filter=...
router.get("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await DeviceService.getDevices(req.query);
    res.json(devices);
  } catch (error) {
    next(error);
  }
});

// POST /devices
router.post(
  "/",
  authenticateToken,
  validationMiddleware(CreateDeviceDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await DeviceService.createDevice(req.body);
      res.status(201).json(device);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /devices/:id
router.put(
  "/:id",
  authenticateToken,
  validationMiddleware(UpdateDeviceDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await DeviceService.updateDevice(
        Number(req.params['id']),
        req.body
      );
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /devices/:id
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await DeviceService.deleteDevice(Number(req.params['id']));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
