import { API_BASE_URL } from '../config/config';

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

export function put(path: string, body: any, options?: RequestInit) {
  console.log('Sending PUT payload:', body);
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const config = { method: 'PUT', body: JSON.stringify(body), ...options };
  config.headers = { ...defaultHeaders, ...config.headers };
  return fetchJSON(path, config);
}

export function patch(path: string, body: any, options?: RequestInit) {
  console.log('Sending PATCH payload:', body);
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const config = { method: 'PATCH', body: JSON.stringify(body), ...options };
  config.headers = { ...defaultHeaders, ...config.headers };
  return fetchJSON(path, config);
}

export function del(path: string, options?: RequestInit) {
  const config = { method: 'DELETE', ...options };
  return fetchJSON(path, config);
}

export async function upload(path: string, formData: FormData, options?: RequestInit) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { method: 'POST', body: formData, ...options });
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

const api = { get, post, put, patch, delete: del, upload };

export default api;
