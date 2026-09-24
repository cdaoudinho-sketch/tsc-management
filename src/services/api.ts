import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tsc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Évite les réponses 304 mises en cache par le navigateur
  if (config.method === "get") {
    config.params = {
      ...(config.params || {}),
      _ts: Date.now(),
    };
  }

  if (
    config.method === "post" ||
    config.method === "put" ||
    config.method === "patch"
  ) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tsc_token");
      localStorage.removeItem("tsc_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;