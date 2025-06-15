/* eslint-disable linebreak-style */
import mqtt from "mqtt";
import { env } from "@utils/env";
import { Datapoint } from "@schemas/datapoint.schema";
import FrostRequestHandler from "@utils/FrostRequestHandler";

type MqttClient = ReturnType<typeof mqtt.connect>;
type IClientOptions = Parameters<typeof mqtt.connect>[1];

class MQTTService {
  private client: MqttClient;
  private frostHandler: FrostRequestHandler;
  private reconnectInterval !: NodeJS.Timeout;

  constructor() {
    const options: IClientOptions = {
      protocolVersion: 5,
      username: env.FROST_CLIENT_ID,
      // Remove redundant password field (using authenticationData)
      properties: {
        authenticationMethod: 'Bearer',
        authenticationData: Buffer.from(env.FROST_CLIENT_SECRET)
      },
      reconnectPeriod: 5000 // Added automatic reconnect
    };

    this.client = mqtt.connect(env.FROST_MQTT_BROKER_URL, options);
    this.frostHandler = new FrostRequestHandler();
    this.initializeHandlers();
    this.setupKeepalive();
  }

  private initializeHandlers() {
    this.client.on("connect", () => {
      console.log("Connected to FROST MQTT broker");
      this.client.subscribe("v1.1/Datastreams/+/Observations", { qos: 1 });
    });

    this.client.on("message", (topic: string, payload: Buffer) => {
      this.handleFrostObservation(topic, payload.toString())
        .catch(error => this.handleError(topic, error));
    });

    this.client.on("error", (error) => {
      console.error("MQTT Connection Error:", error);
    });
  }

  private async handleFrostObservation(topic: string, payload: string) {
    const datastreamId = this.parseDatastreamId(topic);
    if (datastreamId === -1) {
      throw new Error(`Invalid topic format: ${topic}`);
    }

    try {
      const observation = JSON.parse(payload);
      
      // Transactional database operation
      const datapoint = await Datapoint.create({
        sensorId: datastreamId,
        timestamp: new Date(observation.phenomenonTime),
        value: observation.result,
        valueString: JSON.stringify(observation.parameters)
      }).save();

      // Only proceed if datapoint was created
      if (datapoint) {
        await this.frostHandler.postObservation(
          datastreamId.toString(),
          observation
        );
      }
      
    } catch (error) {
      console.error("FROST Data Processing Error:", {
        topic,
        payload,
        error: (error as Error).message
      });
      throw error;
    }
  }

  // Fixed regex to handle both / and () in topics
  private parseDatastreamId(topic: string): number {
    const match = topic.match(/Datastreams[\/\(](\d+)[\)]?/);
    return match ? parseInt(match[1], 10) : -1;
  }

  public publishCommand(datastreamId: number, command: object) {
    if (!this.client.connected) {
      console.error("MQTT Client not connected");
      return;
    }

    const topic = `v1.1/Datastreams(${datastreamId})/Commands`;
    
    this.client.publish(
      topic,
      JSON.stringify(command),
      {
        qos: 1,
        retain: false,
        properties: {
          contentType: "application/json",
          userProperties: { system: "eotlab-backend" }
        }
      },
      (error) => {
        if (error) {
          console.error("Command publish failed:", error);
        }
      }
    );
  }

  private handleError(topic: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("FROST MQTT Error:", { topic, error: message });
    
    this.client.publish("$SYS/errors", JSON.stringify({
      topic,
      error: message,
      timestamp: new Date().toISOString()
    }));
  }

  private setupKeepalive() {
    setInterval(() => {
      if (this.client.connected) {
        this.client.publish("$SYS/keepalive", "ping");
      }
    }, 30000);
  }

  public disconnect() {
    this.client.end();
    clearInterval(this.reconnectInterval);
  }
}

export const mqttService = new MQTTService();
