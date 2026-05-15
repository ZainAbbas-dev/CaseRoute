import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
  
  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Stores isVerified: true/false
    set({ user: userData });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null });
  }
}));

export default useAuthStore;