import { api } from './axios';

export function createDatapoint(data: {
  timestamp: string;
  sensorId: number;
  value?: number;
  valueString?: string;
}) {
  return api.post('/datapoints', data);
}