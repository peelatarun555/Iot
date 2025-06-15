import { api } from './axios';

export function createProject(data: { name: string; sensors: number[] }) {
  return api.post('/projects', data);
}
