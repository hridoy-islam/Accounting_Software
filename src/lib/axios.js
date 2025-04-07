import axios from 'axios';


// Create an instance of axios with custom configurations
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('accounting')); // Use JSON.parse

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// // Function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = JSON.parse(localStorage.getItem('accountingRefresh'));

    if (!refreshToken) {
   
      return null;
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refreshToken`,
      { refreshToken }
    );



    if (response.data && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      localStorage.setItem('accounting', JSON.stringify(accessToken));
      localStorage.setItem('accountingRefresh', JSON.stringify(newRefreshToken));

      
      return accessToken;
    } else {
      return null;
    }
  } catch (error) {

    localStorage.removeItem('accounting');
    localStorage.removeItem('accountingRefresh');

    store.dispatch(logout());

    return null;
  }
};

// Response Interceptor: Handle token expiration and refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && (error.response.status === 500 || error.response.status === 400)) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
