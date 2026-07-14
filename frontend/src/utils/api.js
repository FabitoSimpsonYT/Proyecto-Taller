const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_URL) {
    return window.__APP_CONFIG__.API_URL;
  }

  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();
