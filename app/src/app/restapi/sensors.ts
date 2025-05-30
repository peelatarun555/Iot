import { api } from './axios';

export function createSensor(data: any) {
  return api.post('/sensors', data);
}

export function updateSensor(id: number, data: any) {
  return api.put(`/sensors/${id}`, data);
}

export function deleteSensor(id: number) {
  return api.delete(`/sensors/${id}`);
}

export function fetchAdminSensors(params: any) {
  return api.get('/sensors/admin', { params });
}

export function searchSensors(searchString: string) {
  return api.get('/sensors/search', { params: { q: searchString } });
}

export function fetchSensorTypes() {
  return api.get('/sensors/types');
}