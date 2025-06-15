import { Router } from "express";
import { authenticateToken } from "@middlewares/auth.middleware";
import { validationMiddleware } from "@middlewares/validation.middleware";
import { MqttCommandDto } from "@validations/mqtt.validation";
import { mqttService } from "@services/mqtt.service";
import { SensorService } from "@services/sensor.service";
import { Role } from "@utils/enums";
import { authorize } from "@middlewares/authorization.middleware";

const router = Router();

// Enhanced MQTT command endpoint
router.post(
  "/command",
  authenticateToken,
  authorize([Role.Admin, Role.Operator]), // Additional authorization
  validationMiddleware(MqttCommandDto),
  async (req, res, next) => {
    try {
      const { sensorId, command } = req.body;
      
      // 1. Verify sensor exists and user has access
      const sensor = await SensorService.getSensor(sensorId);
      if (!req.user!.projects.includes(sensor.projectId)) {
        return res.status(403).json({ error: "No access to this sensor" });
      }

      // 2. Publish using FROST-compatible topic structure
      mqttService.publishCommand(
        sensorId,
        JSON.stringify({
          type: "DeviceCommand",
          timestamp: new Date().toISOString(),
          command
        })
      );

      // 3. Enhanced response
      res.json({
        success: true,
        message: "Command queued for delivery",
        metadata: {
          topic: `v1.1/Datastreams(${sensorId})/Commands`,
          sensorId,
          sentAt: new Date()
        }
      });

      // 4. Logging
      console.log(`Command sent to sensor ${sensorId} by user ${req.user!.id}`);
      
    } catch (error) {
      next(error);
    }
  }
);

// Add endpoint for MQTT connection status
router.get("/status", authenticateToken, (req, res) => {
  res.json({
    connected: mqttService.isConnected,
    broker: env.FROST_MQTT_BROKER_URL,
    protocol: "MQTT 5.0"
  });
});

export default router;
