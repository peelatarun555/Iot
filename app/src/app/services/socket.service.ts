import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { SocketState } from '../models/SocketState';

@Injectable({
  providedIn: 'root',
})
export class SocketService extends Socket {
  private readonly _socketState: WritableSignal<SocketState>;

  constructor(private readonly _authService: AuthService) {
    super({
      url: environment.API_URL,
      options: {
        path: environment.SOCKET_IO_ENDPOINT,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: Infinity,
        reconnection: true,
        transports: ['websocket'],
        upgrade: false,
      },
    });

    this._socketState = signal(SocketState.DISCONNECTED);

    this.ioSocket.on('connect', () => {
      this._socketState.set(SocketState.CONNECTED);
    });

    this.ioSocket.on('disconnect', () => {
      this._socketState.set(SocketState.DISCONNECTED);
    });

    this.ioSocket.on('connect_error', () => {
      this._socketState.set(SocketState.CONNECTION_ERROR);
    });

    effect(() => {
      const token = this._authService.token();
      if (this.ioSocket.connected || this.ioSocket.connecting) {
        this.ioSocket.disconnect();
      }

      if (token) {
        this.ioSocket['auth'] = {
          token: `Bearer ${this._authService.token()}`,
        };
        this.ioSocket.connect();
      }
    });

    // Example: Handle MQTT events if received via WebSocket
    this.ioSocket.on('mqtt_message', (message) => {
      console.log('Received MQTT message via WebSocket:', message);
      // Handle MQTT data as needed
    });
  }

  public get socketStatus(): Signal<SocketState> {
    return this._socketState.asReadonly();
  }
}
