export async function saveItem(key, value) {
  return localStorage.setItem(key, value);
}

export async function getItem(key) {
  return localStorage.getItem(key);
}

export async function removeItem(key) {
  return localStorage.removeItem(key);
}
