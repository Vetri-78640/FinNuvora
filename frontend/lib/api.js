import axios from 'axios';
import { getCookie } from './cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getCookie('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on auth endpoints (login/register)
    const isAuthEndpoint = error.config?.url?.includes('/auth/');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear cookies and redirect to login only for protected routes
      if (typeof window !== 'undefined') {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password })
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (oldPassword, newPassword) =>
    api.put('/user/change-password', { oldPassword, newPassword })
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (name, color, icon) =>
    api.post('/categories', { name, color, icon }),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

export const transactionAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  createTransaction: (data) => api.post('/transactions', data),
  smartAdd: (text) => api.post('/transactions/smart-add', { text }),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  getStats: (params) => api.get('/transactions/stats/summary', { params }),
  uploadPDF: (formData) => api.post('/transactions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  scanReceipt: (formData) => api.post('/transactions/scan-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  detectRecurring: () => api.get('/transactions/detect-recurring')
};

export const goalAPI = {
  getGoals: (params) => api.get('/goals', { params }),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  updateGoalProgress: (id, amount) =>
    api.put(`/goals/${id}/progress`, { amount }),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};

export const insightsAPI = {
  generateInsights: (startDate, endDate) =>
    api.post('/insights/generate', { startDate, endDate }),
  getHistory: () => api.get('/insights/history')
};

export const preferencesAPI = {
  getPreferences: () => api.get('/preferences'),
  updatePreferences: (data) => api.put('/preferences', data),
  resetPreferences: () => api.delete('/preferences')
};

export const stockAPI = {
  getQuote: (symbol) => api.get(`/stocks/quote/${symbol}`),
  getDaily: (symbol, outputsize) =>
    api.get(`/stocks/daily/${symbol}`, { params: { outputsize } }),
  getBatch: (symbols) => api.get(`/stocks/batch?symbols=${symbols}`),
  search: (query) => api.get(`/stocks/search?query=${query}`)
};

export const chatAPI = {
  getHistory: () => api.get('/chat/history'),
  sendMessage: (message) => api.post('/chat/send', { message }),
  clearHistory: () => api.delete('/chat/history')
};

export const portfolioAPI = {
  getPortfolios: () => api.get('/portfolio'),
  getPortfolio: (id) => api.get(`/portfolio/${id}`),
  createPortfolio: (data) => api.post('/portfolio', data),
  updatePortfolio: (id, data) => api.put(`/portfolio/${id}`, data),
  deletePortfolio: (id) => api.delete(`/portfolio/${id}`)
};

export const holdingAPI = {
  getHoldingsByPortfolio: (portfolioId) =>
    api.get(`/holding/portfolio/${portfolioId}`),
  getHolding: (id) => api.get(`/holding/${id}`),
  createHolding: (data) => api.post('/holding', data),
  smartAdd: (text, portfolioId) => api.post('/holding/smart-add', { text, portfolioId }),
  updateHolding: (id, data) => api.put(`/holding/${id}`, data),
  deleteHolding: (id) => api.delete(`/holding/${id}`)
};

export const plaidAPI = {
  createLinkToken: () => api.post('/plaid/create_link_token'),
  setAccessToken: (public_token) => api.post('/plaid/set_access_token', { public_token }),
  syncTransactions: () => api.post('/plaid/sync_transactions')
};

export default api;
