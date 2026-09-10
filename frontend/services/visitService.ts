import { apiGet, apiPost } from './api';

export type Visit = {
  id: string;
  title: string;
  status: string;
  location?: string;
};

export async function getVisits() {
  return apiGet<Visit[]>('/visits');
}

export async function createVisit(data: Partial<Visit>) {
  return apiPost<Visit>('/visits', data);
}
