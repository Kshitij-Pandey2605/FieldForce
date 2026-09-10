import { apiPost } from './api';

export async function loginUser(email, password) {
  return apiPost('/auth/login', { email, password });
}

export async function registerUser(name, email, password) {
  return apiPost('/auth/register', { name, email, password });
}
