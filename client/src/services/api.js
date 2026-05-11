import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export const healthCheck = () => api.get("/health");

export const runAlgorithm = (route, payload) => api.post(`/crypto/${route}`, payload);
export const runBenchmarks = (payload) => api.post("/benchmarks/run", payload);
export const fetchBenchmarkHistory = () => api.get("/benchmarks/history");
export const fetchComparison = () => api.get("/analysis/comparison");
export const fetchSecurity = () => api.get("/analysis/security");

export const askAITutor = (payload) => api.post("/ai/explain", payload);

export default api;
