import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_KEY = 'accounting';

// The Redux store is injected from redux/store.ts to avoid a circular import
// (store -> authSlice -> axios -> store).
let store;
export const injectStore = (_store) => {
  store = _store;
};

export const getAccessToken = () => {
  try {
    return JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
  } catch {
    return null;
  }
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true // send the httpOnly refresh-token cookie
});

// Attach access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear everything and send the user to the login page
let isLoggingOut = false;
export const forceLogout = async () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (store) {
      const { logout } = await import('../redux/features/authSlice');
      await store.dispatch(logout());
    }
  } finally {
    isLoggingOut = false;
    if (window.location.pathname !== '/') {
      window.location.replace('/');
    }
  }
};

// A single shared refresh request, so parallel 401s don't each trigger a refresh
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const storedRefreshToken = store?.getState()?.auth?.refreshToken;

    refreshPromise = axios
      .post(
        `${API_URL}/auth/refreshToken`,
        // cookie is preferred server-side; body is a fallback when cross-site cookies are blocked
        storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
        { withCredentials: true }
      )
      .then(async (response) => {
        const accessToken = response?.data?.data?.accessToken;
        if (!accessToken) throw new Error('No access token returned');

        localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
        if (store) {
          const { setAccessToken } = await import(
            '../redux/features/authSlice'
          );
          store.dispatch(setAccessToken(accessToken));
        }
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const isAuthRoute = (url = '') =>
  /\/auth\/(login|refreshToken|logout|signup)/.test(url);

// Refresh on expired access token, retry once; log out if refresh fails
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Already retried with a fresh token and still 401 -> session is invalid
    if (originalRequest._retry) {
      await forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh token expired or invalid -> automatic logout
      await forceLogout();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
