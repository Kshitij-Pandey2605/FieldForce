import { apiGet } from './api';

export async function getContacts() {
  return apiGet('/contacts');
}
