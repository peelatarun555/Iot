import { api } from './axios';

export function createPlace(data: { name: string; parentId?: number }) {
  return api.post('/places', data);
}

export function updatePlace(id: number, data: { name: string; parentId?: number }) {
  return api.put(`/places/${id}`, data);
}

export function deletePlace(id: number) {
  return api.delete(`/places/${id}`);
}

export function fetchAdminPlaces(params: any) {
  return api.get('/places/admin', { params });
}

export function searchPlaces(searchString: string) {
  return api.get(`/places/search`, { params: { q: searchString } });
}