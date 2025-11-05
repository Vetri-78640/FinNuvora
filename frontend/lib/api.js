import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  getStats: (params) => api.get('/transactions/stats/summary', { params })
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

export const stockAPI = {
  getQuote: (symbol) => api.get(`/stocks/quote/${symbol}`),
  getDaily: (symbol, outputsize) =>
    api.get(`/stocks/daily/${symbol}`, { params: { outputsize } }),
  getBatch: (symbols) => api.post('/stocks/batch', { symbols }),
  search: (keyword) => api.get('/stocks/search', { params: { keyword } })
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
  updateHolding: (id, data) => api.put(`/holding/${id}`, data),
  deleteHolding: (id) => api.delete(`/holding/${id}`)
};

export default api;
