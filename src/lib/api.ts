const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';

export const api = {
  get: async (endpoint: string) => {
    return request(endpoint, 'GET');
  },
  post: async (endpoint: string, data?: any) => {
    return request(endpoint, 'POST', data);
  },
  put: async (endpoint: string, data?: any) => {
    return request(endpoint, 'PUT', data);
  },
  delete: async (endpoint: string) => {
    return request(endpoint, 'DELETE');
  }
};

async function request(endpoint: string, method: string, data?: any) {
  const sessionStr = localStorage.getItem('auth_session');
  let token = null;
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.access_token;
    } catch (e) {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
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
