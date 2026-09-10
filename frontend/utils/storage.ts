export async function saveItem(key: string, value: string) {
  return localStorage.setItem(key, value);
}

export async function getItem(key: string) {
  return localStorage.getItem(key);
}

export async function removeItem(key: string) {
  return localStorage.removeItem(key);
}
