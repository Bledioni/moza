export const API_BASE_URL = 'http://localhost:8000/api';
export const STORAGE_BASE_URL = 'http://localhost:8000/storage';

export function resolvePhotoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${STORAGE_BASE_URL}/${path}`;
}