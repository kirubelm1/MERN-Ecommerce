import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "customer"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
