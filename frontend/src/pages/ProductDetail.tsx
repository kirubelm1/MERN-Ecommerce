"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../config/api"
import type { Product } from "../types"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import Button from "../components/ui/Button"
import StarRating from "../components/StarRating"

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [userRating, setUserRating] = useState(0)
  const [review, setReview] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get<Product>(`/products/${id}`)
        setProduct(data)
        
        // Fetch reviews
        const reviewsRes = await api.get(`/products/${id}/ratings`)
        setReviews(reviewsRes.data.ratings || [])
        
        // Check if user has purchased
        if (user) {
          try {
            const ordersRes = await api.get("/orders/myorders")
            const purchased = ordersRes.data.some((order: any) =>
              order.items.some((item: any) => item.product === id)
            )
            setHasPurchased(purchased)
            
            // Check if user already rated
            const existingRating = data.ratings?.find(
              (r: any) => r.userId === user._id
            )
            if (existingRating) {
              setUserRating(existingRating.stars)
              setReview(existingRating.review || "")
            }
          } catch (error) {
            console.error("Error checking purchase:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, user])

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      for (let i = 0; i < quantity; i++) {
        addItem(product)
      }
      alert(`${quantity} x ${product.name} added to cart!`)
    }
  }

  const handleSubmitRating = async () => {
    if (!product || !userRating) {
      alert("Please select a rating")
      return
    }
    
    setSubmittingRating(true)
    try {
      const { data } = await api.post(`/products/${product._id}/rating`, {
        stars: userRating,
        review,
      })
      
      // Refresh product data and reviews
      const productRes = await api.get<Product>(`/products/${product._id}`)
      setProduct(productRes.data)
      
      const reviewsRes = await api.get(`/products/${product._id}/ratings`)
      setReviews(reviewsRes.data.ratings || [])
      
      alert("Rating submitted successfully!")
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit rating")
    } finally {
      setSubmittingRating(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Button onClick={() => navigate("/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-[500px] object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.featured && (
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* Rating Display */}
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={product.averageRating || 0} readonly size={24} />
                  <span className="text-lg font-semibold text-gray-700">
                    {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-gray-500">({product.totalRatings || 0} reviews)</span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-5xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-gray-500 line-through text-xl">
                        ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-semibold ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rate This Product - Only if purchased */}
              {user && hasPurchased && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Rate This Product</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <StarRating rating={userRating} onRate={setUserRating} size={32} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your experience with this product..."
                      />
                    </div>
                    <Button
                      onClick={handleSubmitRating}
                      disabled={!userRating || submittingRating}
                      className="w-full"
                    >
                      {submittingRating ? "Submitting..." : "Submit Rating"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Customer Reviews */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((rating, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                            {rating.userId?.name?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {rating.userId?.name || "Anonymous"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(rating.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <StarRating rating={rating.stars} readonly size={16} />
                            {rating.review && (
                              <p className="text-gray-700 mt-2">{rating.review}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-gray-700 font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-4 text-lg"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Add to Cart
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
