import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api, type User, type CartItem, type Product } from "./api"

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    name: string
    email: string
    password: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }) => Promise<void>
  logout: () => void
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

interface WishlistState {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        const { data } = await api.post<User>("/auth/login", { email, password })
        set({ user: data })
      },
      register: async (userData) => {
        const { data } = await api.post<User>("/auth/register", userData)
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const items = get().items
        const existingItem = items.find((item) => item._id === product._id)

        if (existingItem) {
          set({
            items: items.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },
      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item._id !== productId) })
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
        } else {
          set({
            items: get().items.map((item) => (item._id === productId ? { ...item, quantity } : item)),
          })
        }
      },
      clearCart: () => {
        set({ items: [] })
      },
      get total() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product: Product) => {
        const items = get().items
        if (!items.find((item) => item._id === product._id)) {
          set({ items: [...items, product] })
        }
      },
      removeFromWishlist: (productId: string) => {
        set({ items: get().items.filter((item) => item._id !== productId) })
      },
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item._id === productId)
      },
    }),
    {
      name: "wishlist-storage",
    },
  ),
)
