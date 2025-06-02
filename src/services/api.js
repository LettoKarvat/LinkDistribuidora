// src/services/api.js
import axios from "axios";
import useAuthStore from "../stores/useAuth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

/* ───── request: injeta access-token ───── */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ───── response: tenta refresh ao 401 ───── */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config: origConfig } = err;
    if (!response) {
      // Falha de rede ou sem resposta do servidor
      return Promise.reject(err);
    }

    // Se for 401 e ainda não tiver tentado um refresh neste request
    if (response.status === 401 && !origConfig._retry) {
      origConfig._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        // Sem refreshToken → força logout
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }

      try {
        // Chama /auth/refresh usando o mesmo baseURL
        // O backend espera a refreshToken em Authorization: Bearer <refreshToken>
        const { data } = await api.post("/auth/refresh", null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        // O backend retorna: { access_token: "...novo token..." }
        const { access_token } = data;
        if (!access_token) {
          // Se por algum motivo não vier o access_token, força logout
          useAuthStore.getState().logout();
          return Promise.reject(err);
        }

        // Atualiza somente o accessToken no store (mantém o refreshToken antigo)
        useAuthStore.getState().setTokens(access_token, refreshToken);

        // Reconfigura o header do request original e repete
        origConfig.headers.Authorization = `Bearer ${access_token}`;
        return api(origConfig);
      } catch (refreshErr) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      }
    }

    // 422: devolve mensagem amigável e objetos de validação, se houver
    if (response.status === 422) {
      return Promise.reject({
        message: "Dados inválidos. Verifique os campos.",
        validationErrors: response.data?.errors || {},
        originalError: err,
      });
    }

    return Promise.reject(err);
  }
);

export default api;
