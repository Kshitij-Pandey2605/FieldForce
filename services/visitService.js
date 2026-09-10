import { apiGet, apiPost } from './api';

export async function getVisits() {
  return apiGet('/visits');
}

export async function createVisit(data) {
  return apiPost('/visits', data);
}
