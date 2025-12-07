"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import Button from "../components/ui/Button"

export default function OrderConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!orderId) {
      navigate("/")
    }
  }, [orderId, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 font-medium">Order ID</p>
            <p className="text-lg font-mono text-green-900">{orderId}</p>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            You will receive an email confirmation shortly. Once your order is delivered, you can rate the products.
          </p>
          
          <div className="space-y-3">
            <Button onClick={() => navigate("/orders")} className="w-full">
              View My Orders
            </Button>
            <Button onClick={() => navigate("/products")} variant="secondary" className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
