import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', null, { params: { old_password: oldPassword, new_password: newPassword } }),
};

// Categories APIs
export const categoriesAPI = {
  getAll: (activeOnly = true) => api.get('/categories/', { params: { active_only: activeOnly } }),
  getWithCounts: (activeOnly = true) => api.get('/categories/with-counts', { params: { active_only: activeOnly } }),
  getById: (id) => api.get(`/categories/${id}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Products APIs
export const productsAPI = {
  getAll: (params = {}) => api.get('/products/', { params }),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getWhatsAppLink: (id) => api.get(`/products/${id}/whatsapp-link`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Customers APIs
export const customersAPI = {
  getAll: (params = {}) => api.get('/customers/', { params }),
  getWithStats: (params = {}) => api.get('/customers/with-stats', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Invoices APIs
export const invoicesAPI = {
  getAll: (params = {}) => api.get('/invoices/', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices/', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  delete: (id) => api.delete(`/invoices/${id}`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  getWhatsAppLink: (id) => api.get(`/invoices/${id}/whatsapp-link`),
  sendWhatsApp: (id) => api.post(`/invoices/${id}/send-whatsapp`),
};

// WhatsApp APIs
export const whatsappAPI = {
  shareInvoice: (id) => api.get(`/invoices/${id}/whatsapp-link`),
  getProductLink: (id) => api.get(`/products/${id}/whatsapp-link`),
};

// Offers APIs
export const offersAPI = {
  getAll: (params = {}) => api.get('/offers/', { params }),
  getActive: () => api.get('/offers/', { params: { active_only: true, current_only: true } }),
  getAllAdmin: () => api.get('/offers/all'),
  getById: (id) => api.get(`/offers/${id}`),
  create: (data) => api.post('/offers/', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

// Contact APIs
export const contactAPI = {
  submit: (data) => api.post('/contact/', data),
  getAll: (params = {}) => api.get('/contact/', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  markRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentInvoices: (limit = 5) => api.get('/dashboard/recent-invoices', { params: { limit } }),
  getRecentCustomers: (limit = 5) => api.get('/dashboard/recent-customers', { params: { limit } }),
  getTopProducts: (limit = 5) => api.get('/dashboard/top-products', { params: { limit } }),
  getMonthlyRevenue: (months = 6) => api.get('/dashboard/monthly-revenue', { params: { months } }),
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/settings/'),
  update: (data) => api.put('/settings/', data),
  initialize: () => api.post('/settings/initialize'),
};

// Business Info API
export const businessAPI = {
  getInfo: () => api.get('/business-info'),
};

export default api;
