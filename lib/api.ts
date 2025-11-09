import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("auth-storage")
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        if (state?.user?.token) {
          config.headers.Authorization = `Bearer ${state.user.token}`
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error)
      }
    }
  }
  return config
})

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  cloudinaryPublicId: string
  stock: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: "customer" | "admin"
  token: string
}

export interface CartItem extends Product {
  quantity: number
}
