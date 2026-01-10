import { API_BASE_URL } from './config';

export async function fetchJSON(path: string, opts?: RequestInit) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { ...opts });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function get(path: string, options?: RequestInit) {
  return fetchJSON(path, options);
}

export function post(path: string, body: any, options?: RequestInit) {
  console.log('Sending payload:', body);
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const mergedHeaders = { ...defaultHeaders, ...options?.headers };
  return fetchJSON(path, { method: 'POST', headers: mergedHeaders, body: JSON.stringify(body), ...options });
}

const api = { get, post };

export default api;
