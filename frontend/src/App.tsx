import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import ToastContainer from "./components/ToastContainer"
import { useToast } from "./hooks/useToast"
import { createContext, useContext } from "react"

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToastContext must be used within ToastProvider")
  return context
}
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import Admin from "./pages/Admin"
import Analytics from "./pages/Analytics"
import Orders from "./pages/Orders"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import OrderConfirmation from "./pages/OrderConfirmation"
import AdminOrders from "./pages/AdminOrders"

function App() {
  const toast = useToast()
  
  return (
    <ToastContext.Provider value={toast}>
      <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute requiredRole="customer">
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute requiredRole="customer">
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredRole="customer">
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="customer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="customer">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute requiredRole="customer">
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminOrders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </Router>
    </ToastContext.Provider>
  )
}

export default App
