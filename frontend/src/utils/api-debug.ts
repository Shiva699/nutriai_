import { API_CONFIG } from "../config/api";

export function logApiConfig() {
  console.log("🔧 API Configuration:", {
    mode: import.meta.env.MODE,
    apiUrl: API_CONFIG.apiUrl,
    isDevelopment: import.meta.env.MODE === "development",
    viteApiUrl: import.meta.env.VITE_API_URL,
  });
}

export function logApiCall(url: string, method: string, data?: any) {
  if (import.meta.env.MODE === "development") {
    console.log(`📡 API Call: ${method} ${url}`, data ? { data } : "");
  }
}

export function logApiResponse(url: string, response: Response, data?: any) {
  if (import.meta.env.MODE === "development") {
    console.log(`📥 API Response: ${response.status} ${url}`, data ? { data } : "");
  }
}