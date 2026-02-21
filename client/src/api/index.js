const BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur réseau');
  return data;
}

export const api = {
  auth: {
    login: (username, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    register: (username, password) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
    me: () => request('/auth/me'),
  },
  tasks: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      return request(`/tasks${qs ? `?${qs}` : ''}`);
    },
    create: (task) =>
      request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
    update: (id, data) =>
      request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, status) =>
      request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id) =>
      request(`/tasks/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request('/categories'),
    create: (cat) =>
      request('/categories', { method: 'POST', body: JSON.stringify(cat) }),
    update: (id, data) =>
      request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/categories/${id}`, { method: 'DELETE' }),
  },
  stats: {
    get: () => request('/stats'),
  },
};
