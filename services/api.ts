import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

let getToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export const setupApiAuth = (
  tokenGetter: () => string | null,
  unauthorizedHandler: () => void
) => {
  getToken = tokenGetter;
  onUnauthorized = unauthorizedHandler;
};

api.interceptors.request.use(
  (config) => {
    const token = getToken ? getToken() : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);