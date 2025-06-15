import { api } from './axios';

export function createDevice(data: any) {
  return api.post('/devices', data);
}

export function updateDevice(id: number, data: any) {
  return api.put(`/devices/${id}`, data);
}

export function deleteDevice(id: number) {
  return api.delete(`/devices/${id}`);
}

export function fetchAdminDevices(params: any) {
  return api.get('/devices/admin', { params });
}

export function searchDevices(searchString: string) {
  return api.get('/devices/search', { params: { q: searchString } });
}

export function fetchDeviceTypes() {
  return api.get('/devices/types');
}