import { create } from "zustand";

interface ApiStore {
  apiBase: string;
  token:   string | null;
  setToken: (token: string | null) => void;
}

export const useApiStore = create<ApiStore>((set) => ({
  apiBase:  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  token:    null,
  setToken: (token) => set({ token }),
}));
