const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.__APP_CONFIG__ && 'API_URL' in window.__APP_CONFIG__) {
    return window.__APP_CONFIG__.API_URL;
  }

  // Soporte para Vite y local
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Por defecto en local
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
