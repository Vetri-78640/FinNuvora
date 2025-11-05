import { create } from 'zustand';
import { authAPI } from '../lib/api';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(email, password, name);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
    }
  }
}));
