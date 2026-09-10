import { apiGet } from './api';

export type Contact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export async function getContacts() {
  return apiGet<Contact[]>('/contacts');
}
