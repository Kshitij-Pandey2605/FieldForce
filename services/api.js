export const API_BASE_URL = 'http://localhost:5001/api';

export async function apiGet(url) {
  const response = await fetch(`${API_BASE_URL}${url}`);
  return response.json();
}

export async function apiPost(url, body) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
}
