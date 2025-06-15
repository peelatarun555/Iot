/* eslint-disable linebreak-style */
import axios, { AxiosInstance, AxiosError } from "axios";
import https from "https";
import { Mutex } from "async-mutex";
import { URLSearchParams } from "url";
import dotenv from "dotenv";
import mqtt, { MqttClient, IClientSubscribeOptions, IClientPublishOptions } from "mqtt";
import { EventEmitter } from "events";
import { env } from "@utils/env"; 

dotenv.config();

export class FrostApiError extends Error {
  constructor( 
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "FrostApiError";
  }
}

interface FrostMqttOptions extends IClientSubscribeOptions {
  retain?: boolean;
}

export default class FrostRequestHandler extends EventEmitter {
  // REST Configuration
  private readonly serverUrl: string;
  private readonly authUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly username: string;
  private readonly password: string;
  private readonly scope: string;
  
  // Token Management
  private accessToken: string | null = null;
  private expiresAt: number = 0;
  private tokenMutex = new Mutex();
  
  // HTTP Client
  private axiosInstance: AxiosInstance;
  
  // MQTT Configuration
  private mqttClient: MqttClient | null = null;
  private mqttSubscriptions = new Map<string, FrostMqttOptions>();
  private mqttConnected = false;

  constructor() {
    super();
    
    // Initialize REST configuration
    this.serverUrl = env.FROST_SERVER_URL;
    this.authUrl = env.FROST_AUTH_URL;
    this.clientId = env.FROST_CLIENT_ID;
    this.clientSecret = env.FROST_CLIENT_SECRET;
    this.username = env.FROST_USERNAME;
    this.password = env.FROST_PASSWORD;
    this.scope = env.FROST_SCOPE || "openid";

    // Configure Axios instance
    this.axiosInstance = axios.create({
      baseURL: this.serverUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: env.NODE_ENV === "production",
      }),
      headers: {
        Accept: "application/json",
      },
      timeout: 10000,
    });

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleRequestError(error)
    );

    // Initialize MQTT if configured
    if (env.FROST_MQTT_BROKER_URL) {
      this.initializeMqttClient();
    }
  }

  //#region MQTT Implementation
  private initializeMqttClient() {
    this.mqttClient = mqtt.connect(env.FROST_MQTT_BROKER_URL!, {
      username: this.accessToken ?? undefined,
      protocolVersion: 5,
      properties: {
        authenticationMethod: "Bearer",
         authenticationData: Buffer.from(this.accessToken ?? '')
      },
      reconnectPeriod: 5000,
    });

    this.mqttClient.on("connect", () => {
      this.mqttConnected = true;
      this.resubscribeAll();
      this.emit("mqttConnect");
    });

    this.mqttClient.on("message", (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString());
        this.emit("observation", { topic, message });
      } catch (error) {
        this.emit("mqttError", new Error(`Failed to parse MQTT message: ${error}`));
      }
    });

    this.mqttClient.on("error", (error) => {
      this.emit("mqttError", error);
    });

    this.mqttClient.on("close", () => {
      this.mqttConnected = false;
      this.emit("mqttDisconnect");
    });
  }

  public async subscribe(
    topic: string, 
    options: FrostMqttOptions = { qos: 1 }
  ): Promise<void> {
    await this.ensureToken();
    
    if (!this.mqttClient) {
      throw new Error("MQTT client not initialized");
    }

    this.mqttSubscriptions.set(topic, options);
    
    if (this.mqttConnected) {
      return new Promise((resolve, reject) => {
        this.mqttClient!.subscribe(topic, options, (err) => {
          if (err) return reject(err);
          this.emit("subscriptionSuccess", topic);
          resolve();
        });
      });
    }
  }

  public async unsubscribe(topic: string): Promise<void> {
    if (this.mqttClient?.connected) {
      return new Promise((resolve, reject) => {
        this.mqttClient!.unsubscribe(topic, (err) => {
          if (err) return reject(err);
          this.mqttSubscriptions.delete(topic);
          resolve();
        });
      });
    }
  }

  public async publish(
    topic: string,
    message: any,
    options: IClientPublishOptions = { qos: 1, retain: false }
  ): Promise<void> {
    await this.ensureToken();
    
    if (!this.mqttClient) {
      throw new Error("MQTT client not initialized");
    }

    return new Promise((resolve, reject) => {
      this.mqttClient!.publish(
        topic,
        JSON.stringify(message),
        options,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  private resubscribeAll() {
    this.mqttSubscriptions.forEach((options, topic) => {
      this.mqttClient!.subscribe(topic, options);
    });
  }
  //#endregion

  //#region REST Implementation
  private async obtainToken(): Promise<void> {
    try {
      const response = await axios.post(
        this.authUrl,
        new URLSearchParams({
          grant_type: "password",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
          scope: this.scope,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.expiresAt = Date.now() + response.data.expires_in * 1000;

      // Reconnect MQTT with new token
      if (this.mqttClient) {
        this.mqttClient.end(true);
        this.initializeMqttClient();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new FrostApiError(
          error.response?.status || 500,
          (error.response?.data as any)?.error || "unknown_error",
          (error.response?.data as any)?.error_description || error.message
        );
      }
      throw error;
    }
  }

  private async ensureToken(): Promise<void> {
    if (!this.accessToken || this.isTokenExpired()) {
      const release = await this.tokenMutex.acquire();
      try {
        if (!this.accessToken || this.isTokenExpired()) {
          await this.obtainToken();
        }
      } finally {
        release();
      }
    }
  }

  private isTokenExpired(): boolean {
    return Date.now() > this.expiresAt - 60000; // 60 seconds buffer
  }

  public async getRequest<T = any>(path: string): Promise<T> {
    await this.ensureToken();
    const response = await this.axiosInstance.get(path, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return response.data;
  }

  public async postRequest<T = any>(path: string, data: any): Promise<T> {
    await this.ensureToken();
    const response = await this.axiosInstance.post(path, data, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return response.data;
  }

  public async safeRequest<T>(
    fn: () => Promise<T>,
    retries = 2
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        if (error instanceof FrostApiError && error.status === 401) {
          this.accessToken = null;
          return this.safeRequest(fn, retries - 1);
        }
        if (error instanceof Error && "code" in error && error.code === "ECONNABORTED") {
          return this.safeRequest(fn, retries - 1);
        }
      }
      throw error;
    }
  }

  private handleRequestError(error: AxiosError): Error {
    if (error.response) {
      return new FrostApiError(
        error.response.status,
        (error.response.data as any)?.error || "unknown_error",
        (error.response.data as any)?.error_description || error.message
      );
    }
    return error;
  }
  //#endregion

  //#region Helper Methods
  public async getDatastream(datastreamId: string) {
    return this.safeRequest(() =>
      this.getRequest(`Datastreams(${datastreamId})`)
    );
  }

  public async getObservations(datastreamId: string, params?: Record<string, any>) {
    return this.safeRequest(() =>
      this.getRequest(`Datastreams(${datastreamId})/Observations${this.buildQueryParams(params)}`)
    );
  }

  public async postObservation(datastreamId: string, observation: any) {
    return this.safeRequest(() =>
      this.postRequest(`Datastreams(${datastreamId})/Observations`, observation)
    );
  }

  private buildQueryParams(params?: Record<string, any>): string {
    if (!params) return "";
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : "";
  }
  //#endregion
}
