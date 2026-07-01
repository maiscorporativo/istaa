const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';

export const api = {
  get: async (endpoint) => {
    return request(endpoint, 'GET');
  },
  post: async (endpoint, data) => {
    return request(endpoint, 'POST', data);
  },
  put: async (endpoint, data) => {
    return request(endpoint, 'PUT', data);
  },
  delete: async (endpoint) => {
    return request(endpoint, 'DELETE');
  }
};

async function request(endpoint, method, data) {
  const sessionStr = localStorage.getItem('auth_session');
  let token = null;
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.access_token;
    } catch (e) {}
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Erro na requisição');
  }

  return result;
}
