import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cv_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const healthCheck = () => api.get("/health");
export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);
export const getMyProfile = () => api.get("/auth/me");

export const runAlgorithm = (route, payload) => api.post(`/crypto/${route}`, payload);
export const runBenchmarks = (payload) => api.post("/benchmarks/run", payload);
export const fetchBenchmarkHistory = () => api.get("/benchmarks/history");
export const fetchComparison = () => api.get("/analysis/comparison");
export const fetchSecurity = () => api.get("/analysis/security");

export const saveRun = (payload) => api.post("/users/runs", payload);
export const fetchMyRuns = () => api.get("/users/runs");
export const updateSavedRun = (id, payload) => api.patch(`/users/runs/${id}`, payload);
export const deleteSavedRun = (id) => api.delete(`/users/runs/${id}`);

export default api;
