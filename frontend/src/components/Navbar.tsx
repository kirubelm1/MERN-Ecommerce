"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useCartStore } from "../store/cartStore"
import { ShoppingCart } from "lucide-react"
import Button from "./ui/Button"

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
  <nav className="bg-white/80 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              E-Shop
            </Link>
            <div className="ml-10 flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                Home
              </Link>
              {user?.role === "customer" && (
                <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Products
                </Link>
              )}
              {user?.role === "admin" && (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Products
                  </Link>
                  <Link to="/admin/analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Analytics
                  </Link>
                  <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Orders
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === "customer" && (
              <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                <Button variant="danger" onClick={handleLogout} className="ml-3">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="ml-2">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
