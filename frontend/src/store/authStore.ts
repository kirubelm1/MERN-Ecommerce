import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "../config/api"
import type { AuthState, User } from "../types"

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        const { data } = await api.post<User>("/auth/login", { email, password })
        set({ user: data })
      },
      register: async (
        name: string,
        email: string,
        password: string,
        phone: string,
        address: string,
        city: string,
        postalCode: string,
        country: string,
      ) => {
        const { data } = await api.post<User>("/auth/register", {
          name,
          email,
          password,
          phone,
          address,
          city,
          postalCode,
          country,
        })
        set({ user: data })
      },
      logout: () => {
        set({ user: null })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
