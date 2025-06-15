import { Request, Response } from 'express';
import { Router } from 'express';
import { DatapointService } from '../services/datapoint.service'; // Adjust path as per your project structure
import { SensorService } from '../services/sensor.service'; // Adjust path as per your project structure
import { hasRoleAccess } from '../middlewares/auth.middleware'; // Adjust path as per your project structure
import { ContextUser } from '../utils/interfaces/context.interface'; // Adjust path as per your project structure
import { Role, Permission } from '../utils/enums'; // Adjust path as per your project structure
import { ValidationRestException } from '../utils/exceptions/restapi.exception'; // Adjust path as per your project structure
import LibraryService from '../services/library.service'; // Adjust path as per your project structure

const router = Router();

// GET /api/datapoints
router.get('/datapoints', async (req: Request, res: Response) => {
  try {
    const { sensorId } = req.query;
    const user = req.user as ContextUser; // Assuming you have middleware to populate user info

    // Check user access for sensor
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(sensorId, user.id, Permission.read);
    } else {
      // Check if sensor exists
      await SensorService.getSensor(sensorId);
    }

    const datapoints = await DatapointService.getDatapoints(req.query);
    res.json(datapoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datapoints/:sensorId/:timestamp
router.get('/datapoints/:sensorId/:timestamp', async (req: Request, res: Response) => {
  try {
    const { sensorId, timestamp } = req.params;
    const user = req.user as ContextUser; // Assuming you have middleware to populate user info

    // Check user access for sensor
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(sensorId, user.id, Permission.read);
    } else {
      // Check if sensor exists
      await SensorService.getSensor(sensorId);
    }

    const datapoint = await DatapointService.getDatapoint(sensorId, timestamp);
    res.json(datapoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datapoints
router.post('/datapoints', async (req: Request, res: Response) => {
  try {
    const { timestamp, value, sensorId, valueString } = req.body;
    const user = req.user as ContextUser; // Assuming you have middleware to populate user info

    if (value == null && valueString == null) {
      throw new ValidationRestException("One of [value, valueString] must not be null");
    }

    // Check user access for sensor
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(sensorId, user.id, Permission.write);
    } else {
      // Check if sensor exists
      await SensorService.getSensor(sensorId);
    }

    if (value == null && Number.isFinite(Number(valueString))) value = Number(valueString);

    const datapoint = await DatapointService.createDatapoint(timestamp, sensorId, value, valueString);
    await LibraryService.onDatapointChange(sensorId);
    res.status(201).json(datapoint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/datapoints/:sensorId/:timestamp
router.put('/datapoints/:sensorId/:timestamp', async (req: Request, res: Response) => {
  try {
    const { timestamp, value, sensorId, valueString } = req.body;
    const user = req.user as ContextUser; // Assuming you have middleware to populate user info

    if (value == null && valueString == null) {
      throw new ValidationRestException("One of [value, valueString] must not be null");
    }

    // Check user access for sensor
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(sensorId, user.id, Permission.write);
    } else {
      // Check if sensor exists
      await SensorService.getSensor(sensorId);
    }

    if (value == null && Number.isFinite(Number(valueString))) value = Number(valueString);

    const datapoint = await DatapointService.updateDatapoint(timestamp, sensorId, value, valueString);
    await LibraryService.onDatapointChange(sensorId);
    res.json(datapoint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/datapoints/:sensorId/:timestamp
router.delete('/datapoints/:sensorId/:timestamp', async (req: Request, res: Response) => {
  try {
    const { sensorId, timestamp } = req.params;
    const user = req.user as ContextUser; // Assuming you have middleware to populate user info

    // Check user access for sensor
    if (!hasRoleAccess(user.role, Role.admin)) {
      await SensorService.checkUserPermission(sensorId, user.id, Permission.write);
    } else {
      // Check if sensor exists
      await SensorService.getSensor(sensorId);
    }

    const deleted = await DatapointService.deleteDatapoint(timestamp, sensorId);
    if (deleted) await LibraryService.onDatapointChange(sensorId);
    res.json({ deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
