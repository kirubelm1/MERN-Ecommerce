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
  discount: number
  features: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: "customer" | "admin"
  token: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

export interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    city: string,
    postalCode: string,
    country: string,
  ) => Promise<void>
  logout: () => void
}

export interface OrderItem {
  product: Product
  quantity: number
  price: number
}

export interface Order {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
  }
  paymentMethod: string
  createdAt: string
  updatedAt: string
}
