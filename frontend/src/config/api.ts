// API Configuration for different environments
const config = {
  development: {
    apiUrl: import.meta.env.VITE_API_URL || "/api", // Uses Vite proxy in development
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || "https://nutriai-t7l0.onrender.com/api", // Direct backend URL in production
  },
};

// Determine environment
const isDevelopment = import.meta.env.MODE === "development";

export const API_CONFIG = isDevelopment ? config.development : config.production;

// Export the base API URL
export const API_BASE_URL = `${API_CONFIG.apiUrl}/chat`;