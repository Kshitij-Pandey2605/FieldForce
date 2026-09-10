import { apiPost } from './api';

export async function loginUser(email: string, password: string) {
  return apiPost<{ token: string; user: { id: string; email: string } }>('/auth/login', {
    email,
    password,
  });
}

export async function registerUser(name: string, email: string, password: string) {
  return apiPost<{ token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
    name,
    email,
    password,
  });
}
