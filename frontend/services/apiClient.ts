import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create Axios instance for relative API calls (proxied by Shopify CLI in dev/prod)
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: dynamically fetch Shopify App Bridge session token and inject it
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && (window as any).shopify) {
      try {
        // App Bridge v4 stores the shopify instance globally
        const token = await (window as any).shopify.idToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch Shopify App Bridge session token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: simply return the response, error handling is done at the UI level
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we receive a re-authorize header, we can handle it or let App Bridge manage it
    return Promise.reject(error);
  }
);

export default apiClient;