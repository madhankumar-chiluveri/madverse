// ─────────────────────────────────────────────────────────────
// src/api/config/axios.ts
//
// Central Axios instance used for any external REST calls
// (e.g. third-party integrations, Gemini REST wrapper, etc.)
// Convex reactive queries/mutations use the Convex SDK directly —
// this client is for plain HTTP endpoints.
// ─────────────────────────────────────────────────────────────
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const DEFAULT_TIMEOUT = 15_000;

function createAxiosClient(
  baseURL: string,
  overrides: AxiosRequestConfig = {}
): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...overrides,
  });

  // ── Request interceptor ─────────────────────────────────────
  instance.interceptors.request.use(
    (config) => {
      // Attach bearer token if present in localStorage
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("convex_token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response interceptor ────────────────────────────────────
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        // Redirect to login on auth failure
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// ── Public API client (external REST calls) ─────────────────
export const apiClient = createAxiosClient("/api");

// ── Gemini REST client (used only when Convex actions aren't available) ─
export const geminiClient = createAxiosClient(
  "https://generativelanguage.googleapis.com/v1beta"
);

export default apiClient;
