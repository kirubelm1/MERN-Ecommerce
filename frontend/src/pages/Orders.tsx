"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useToastContext } from "../App"
import api from "../config/api"
import type { Order } from "../types"
import { Package, Truck, CheckCircle, XCircle, Star } from "lucide-react"
import StarRating from "../components/StarRating"
import Button from "../components/ui/Button"

export default function Orders() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { showToast } = useToastContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingProduct, setRatingProduct] = useState<any>(null)
  const [userRating, setUserRating] = useState(0)
  const [review, setReview] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      const { data } = await api.get<Order[]>("/orders/myorders")
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!ratingProduct || userRating === 0) {
      showToast("Please select a rating", "error")
      return
    }

    setSubmittingRating(true)
    try {
      await api.post(`/products/${ratingProduct._id}/rating`, {
        stars: userRating,
        review: review,
      })
      showToast("Rating submitted successfully!", "success")
      setRatingProduct(null)
      setUserRating(0)
      setReview("")
      fetchOrders() // Refresh orders to update rated status
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to submit rating", "error")
    } finally {
      setSubmittingRating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="w-5 h-5 text-yellow-600" />
      case "processing":
        return <Package className="w-5 h-5 text-blue-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-600" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Progress Tracker */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between relative">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{
                            width:
                              order.status === "pending"
                                ? "0%"
                                : order.status === "processing"
                                ? "33%"
                                : order.status === "shipped"
                                ? "66%"
                                : "100%",
                          }}
                        />
                      </div>
                      
                      {/* Steps */}
                      {[
                        { key: "pending", label: "Order Placed", icon: Package },
                        { key: "processing", label: "Processing", icon: Package },
                        { key: "shipped", label: "Shipped", icon: Truck },
                        { key: "delivered", label: "Delivered", icon: CheckCircle },
                      ].map((step, index) => {
                        const isActive =
                          (order.status === "pending" && index === 0) ||
                          (order.status === "processing" && index <= 1) ||
                          (order.status === "shipped" && index <= 2) ||
                          (order.status === "delivered" && index <= 3)
                        const Icon = step.icon
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-xs mt-2 font-medium ${
                                isActive ? "text-blue-600" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Shipping Address</p>
                      <p className="text-gray-600">{order.shippingAddress.address}</p>
                      <p className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-600">{order.shippingAddress.country}</p>
                      <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Payment Method</p>
                      <p className="text-gray-600">{order.paymentMethod.replace("_", " ").toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <img
                          src={item.product.imageUrl || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-blue-600">
                            ${Number(item.price * item.quantity || 0).toFixed(2)}
                          </p>
                        </div>
                        {order.status === "delivered" && !item.rated && (
                          <Button
                            onClick={() => setRatingProduct({ ...item.product, orderId: order._id })}
                            className="flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Rate Product
                          </Button>
                        )}
                        {order.status === "delivered" && item.rated && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Rated</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">${Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Product</h2>
            <div className="mb-4">
              <img
                src={ratingProduct.imageUrl || "/placeholder.svg"}
                alt={ratingProduct.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{ratingProduct.name}</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating rating={userRating} onRate={setUserRating} size={32} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Share your experience with this product..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRatingProduct(null)
                  setUserRating(0)
                  setReview("")
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submittingRating}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submittingRating || userRating === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
