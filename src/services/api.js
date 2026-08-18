import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fiveforms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prevent redirecting if the 401 came from the login attempt itself
    const isLoginEndpoint = error.config && error.config.url && error.config.url.includes('/auth/login');
    
    if (error.response && error.response.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('fiveforms_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const formsApi = {
  getForms: async () => {
    const res = await api.get('/forms');
    return res.data;
  },
  getFormById: async (id) => {
    const res = await api.get(`/forms/${id}`);
    return res.data;
  },
  getFormBySlug: async (slug) => {
    const res = await api.get(`/forms/public/${slug}`);
    return res.data;
  },
  createForm: async (data) => {
    const res = await api.post('/forms', data);
    return res.data;
  },
  updateForm: async (id, data) => {
    const res = await api.put(`/forms/${id}`, data);
    return res.data;
  },
  deleteForm: async (id) => {
    const res = await api.delete(`/forms/${id}`);
    return res.data;
  }
};

export const submissionsApi = {
  createSubmission: async (slug, data) => {
    const res = await api.post(`/submissions/public/${slug}`, data);
    return res.data;
  },
  getSubmissions: async (formId = '', status = '') => {
    const res = await api.get('/submissions', { params: { formId, status } });
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/submissions/${id}/status`, { status });
    return res.data;
  },
  deleteSubmission: async (id) => {
    const res = await api.delete(`/submissions/${id}`);
    return res.data;
  }
};

export default api;
