import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (userData, token) => {
    // Save token to browser storage so they stay logged in
    localStorage.setItem('caseroute_token', token);
    set({ user: userData, token });
  },
  logout: () => {
    localStorage.removeItem('caseroute_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;