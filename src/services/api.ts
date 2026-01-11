import { API_BASE_URL } from './config';

export async function fetchJSON(path: string, opts?: RequestInit) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { ...opts });
  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage += ` - ${errorData.message}`;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += ` - ${errorData.errors.join(', ')}`;
        }
      }
    } catch (e) {
      // Ignore if can't parse error response
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export function get(path: string, options?: RequestInit) {
  return fetchJSON(path, options);
}

export function post(path: string, body: any, options?: RequestInit) {
  console.log('Sending payload:', body);
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const config = { method: 'POST', body: JSON.stringify(body), ...options };
  config.headers = { ...defaultHeaders, ...config.headers };
  return fetchJSON(path, config);
}

const api = { get, post };

export default api;
