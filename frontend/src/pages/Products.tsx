"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../config/api"
import type { Product } from "../types"
import { useCartStore } from "../store/cartStore"
import { useToastContext } from "../App"
import { ShoppingCart } from "lucide-react"
import Button from "../components/ui/Button"
import StarRating from "../components/StarRating"

export default function Products() {
  const navigate = useNavigate()
  const { showToast } = useToastContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)

  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get<Product[]>("/products")
        setProducts(data)
        const max = Math.max(...data.map((p) => p.price), 1000)
        setMaxPrice(max)
        setPriceRange([0, max])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = products.filter((p) => {
    const categoryMatch = selectedCategory === "all" || p.category === selectedCategory
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1]
    return categoryMatch && priceMatch
  })

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addItem(product)
      showToast(`${product.name} added to cart!`, "success")
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Products</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 space-y-6 lg:sticky lg:top-20 lg:self-start">
            {/* Category Filter */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transform transition-transform duration-200 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
                  >
                    <div className="relative">
                      <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-cover" />
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-sm text-blue-600 font-medium mb-1">{product.category}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={product.averageRating || 0} readonly size={16} />
                        <span className="text-sm text-gray-600">
                          ({product.totalRatings || 0})
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-blue-600">${Number(product.price ?? 0).toFixed(2)}</span>
                          <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                          </span>
                        </div>

                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                          disabled={product.stock === 0}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
