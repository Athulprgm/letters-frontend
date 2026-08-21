export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.lettershamper.shop').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default apiUrl;
