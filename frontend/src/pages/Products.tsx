"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../config/api"
import type { Product } from "../types"
import { useCartStore } from "../store/cartStore"
import { useToastContext } from "../App"
import { ShoppingCart, Heart, Search, Grid, List, SlidersHorizontal, X, TrendingUp, Star, Package, Eye, GitCompare, Clock, Zap, Shield, Truck, RefreshCw, Award, DollarSign, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react"
import Button from "../components/ui/Button"
import StarRating from "../components/StarRating"

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "newest"
type ViewMode = "grid" | "list"

export default function Products() {
  const navigate = useNavigate()
  const { showToast } = useToastContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [compareList, setCompareList] = useState<Set<string>>(new Set())
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [showInStock, setShowInStock] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)

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

  const filteredProducts = products
    .filter((p) => {
      const categoryMatch = selectedCategory === "all" || p.category === selectedCategory
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1]
      const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase())
      const stockMatch = !showInStock || p.stock > 0
      return categoryMatch && priceMatch && searchMatch && stockMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "featured":
        default:
          return b.featured ? 1 : -1
      }
    })

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addItem(product)
      showToast(`${product.name} added to cart!`, "success")
    }
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
        showToast("Removed from wishlist", "success")
      } else {
        newSet.add(productId)
        showToast("Added to wishlist", "success")
      }
      return newSet
    })
  }

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
        showToast("Removed from comparison", "success")
      } else {
        if (newSet.size >= 4) {
          showToast("You can compare up to 4 products", "error")
          return prev
        }
        newSet.add(productId)
        showToast("Added to comparison", "success")
      }
      return newSet
    })
  }

  const handleProductClick = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p._id !== product._id)
      return [product, ...filtered].slice(0, 5)
    })
    navigate(`/products/${product._id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discover Products
          </h1>
          <p className="text-gray-600">Explore our curated collection of premium products</p>
        </div>

        {/* Search & Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-md" : "hover:bg-gray-200"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white shadow-md" : "hover:bg-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Active Filters & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {selectedCategory}
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Search: {searchQuery}
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {showInStock && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  In Stock Only
                  <X className="w-4 h-4 cursor-pointer" onClick={() => setShowInStock(false)} />
                </span>
              )}
            </div>
            {compareList.size > 0 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <GitCompare className="w-4 h-4" />
                Compare ({compareList.size})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-72 space-y-4 ${showFilters ? "block" : "hidden lg:block"} lg:sticky lg:top-4 lg:self-start lg:max-h-screen lg:overflow-y-auto`}>
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Price Range
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-bold mb-3">Availability</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInStock}
                  onChange={(e) => setShowInStock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm font-medium">In Stock Only</span>
              </label>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md p-4 text-white">
              <h3 className="text-sm font-bold mb-1">Products Found</h3>
              <p className="text-2xl font-bold">{filteredProducts.length}</p>
              <p className="text-xs opacity-90">out of {products.length} total</p>
            </div>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Recently Viewed
                </h3>
                <div className="space-y-2">
                  {recentlyViewed.slice(0, 3).map((product) => (
                    <div
                      key={product._id}
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="flex gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs line-clamp-1">{product.name}</p>
                        <p className="text-blue-600 font-bold text-xs">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-bold mb-3">Why Shop With Us</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Secure Payment</p>
                    <p className="text-xs text-gray-600">100% secure transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <RefreshCw className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0"></div>
                </div>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {filteredProducts.map((product) => (
                  viewMode === "grid" ? (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                    >
                      <div className="relative overflow-hidden">
                        <img 
                          src={product.imageUrl || "/placeholder.svg"} 
                          alt={product.name} 
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        />
                        {product.featured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" fill="currentColor" />
                            Featured
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleWishlist(product._id)
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          >
                            <Heart 
                              className={`w-5 h-5 ${wishlist.has(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setQuickViewProduct(product)
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCompare(product._id)
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                          >
                            <GitCompare 
                              className={`w-5 h-5 ${compareList.has(product._id) ? "text-purple-600" : "text-gray-400"}`}
                            />
                          </button>
                        </div>
                        {product.stock < 10 && product.stock > 0 && (
                          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Only {product.stock} left!
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                          {product.category}
                        </div>
                        <h3 
                          className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleProductClick(product)}
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <StarRating rating={product.averageRating || 0} readonly size={18} />
                          <span className="text-sm font-semibold text-gray-600">
                            {product.averageRating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({product.totalRatings || 0} reviews)
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                          {product.description}
                        </p>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ${Number(product.price ?? 0).toFixed(2)}
                              </span>
                            </div>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              product.stock > 10 
                                ? "bg-green-100 text-green-700" 
                                : product.stock > 0 
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                            </span>
                          </div>

                          <Button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(product)
                            }}
                            disabled={product.stock === 0}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row"
                    >
                      <div className="relative sm:w-64 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                        <img 
                          src={product.imageUrl || "/placeholder.svg"} 
                          alt={product.name} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                          onClick={() => navigate(`/products/${product._id}`)}
                        />
                        {product.featured && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" fill="currentColor" />
                            Featured
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                              {product.category}
                            </div>
                            <h3 
                              className="text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => navigate(`/products/${product._id}`)}
                            >
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <StarRating rating={product.averageRating || 0} readonly size={18} />
                              <span className="text-sm font-semibold text-gray-600">
                                {product.averageRating?.toFixed(1) || "0.0"}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({product.totalRatings || 0} reviews)
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleWishlist(product._id)
                            }}
                            className="p-2 hover:scale-110 transition-transform"
                          >
                            <Heart 
                              className={`w-6 h-6 ${wishlist.has(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                          </button>
                        </div>

                        <p className="text-gray-600 mb-4 flex-1">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ${Number(product.price ?? 0).toFixed(2)}
                            </span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              product.stock > 10 
                                ? "bg-green-100 text-green-700" 
                                : product.stock > 0 
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                            </span>
                          </div>

                          <Button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToCart(product)
                            }}
                            disabled={product.stock === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSearchQuery("")
                    setPriceRange([0, maxPrice])
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Comparison Modal */}
      {showCompareModal && compareList.size >= 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCompareModal(false)}>
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <GitCompare className="w-6 h-6 text-purple-600" />
                Product Comparison
              </h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const compareProducts = products.filter(p => compareList.has(p._id)).slice(0, 2)
                if (compareProducts.length < 2) return null
                
                const [product1, product2] = compareProducts
                const priceDiff = Math.abs(product1.price - product2.price)
                const cheaperProduct = product1.price < product2.price ? product1 : product2
                const ratingDiff = Math.abs((product1.averageRating || 0) - (product2.averageRating || 0))
                const stockDiff = Math.abs(product1.stock - product2.stock)

                return (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Product 1 */}
                    <div className="border-2 border-gray-200 rounded-2xl p-6">
                      <img
                        src={product1.imageUrl || "/placeholder.svg"}
                        alt={product1.name}
                        className="w-full h-64 object-cover rounded-xl mb-4"
                      />
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                        {product1.category}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{product1.name}</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Price</p>
                          <p className="text-3xl font-bold text-blue-600">${product1.price.toFixed(2)}</p>
                          {product1._id === cheaperProduct._id && (
                            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              ${priceDiff.toFixed(2)} Cheaper
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Rating</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={product1.averageRating || 0} readonly size={18} />
                            <span className="font-bold">{(product1.averageRating || 0).toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({product1.totalRatings || 0})</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Stock</p>
                          <p className="font-bold text-lg">{product1.stock} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Description</p>
                          <p className="text-sm text-gray-700">{product1.description}</p>
                        </div>
                        <Button
                          onClick={() => {
                            handleAddToCart(product1)
                            setShowCompareModal(false)
                          }}
                          disabled={product1.stock === 0}
                          className="w-full mt-4"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    {/* Product 2 */}
                    <div className="border-2 border-gray-200 rounded-2xl p-6">
                      <img
                        src={product2.imageUrl || "/placeholder.svg"}
                        alt={product2.name}
                        className="w-full h-64 object-cover rounded-xl mb-4"
                      />
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                        {product2.category}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{product2.name}</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Price</p>
                          <p className="text-3xl font-bold text-blue-600">${product2.price.toFixed(2)}</p>
                          {product2._id === cheaperProduct._id && (
                            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              ${priceDiff.toFixed(2)} Cheaper
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Rating</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={product2.averageRating || 0} readonly size={18} />
                            <span className="font-bold">{(product2.averageRating || 0).toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({product2.totalRatings || 0})</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Stock</p>
                          <p className="font-bold text-lg">{product2.stock} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Description</p>
                          <p className="text-sm text-gray-700">{product2.description}</p>
                        </div>
                        <Button
                          onClick={() => {
                            handleAddToCart(product2)
                            setShowCompareModal(false)
                          }}
                          disabled={product2.stock === 0}
                          className="w-full mt-4"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Comparison Summary & AI Recommendation */}
              {(() => {
                const compareProducts = products.filter(p => compareList.has(p._id)).slice(0, 2)
                if (compareProducts.length < 2) return null
                
                const [product1, product2] = compareProducts
                const priceDiff = Math.abs(product1.price - product2.price)
                const cheaperProduct = product1.price < product2.price ? product1 : product2
                const expensiveProduct = product1.price > product2.price ? product1 : product2
                const betterRated = (product1.averageRating || 0) > (product2.averageRating || 0) ? product1 : product2
                const moreStock = product1.stock > product2.stock ? product1 : product2

                // Smart Recommendation Algorithm
                const getRecommendation = () => {
                  const p1Rating = product1.averageRating || 0
                  const p2Rating = product2.averageRating || 0
                  const p1Value = p1Rating / product1.price // Value score: rating per dollar
                  const p2Value = p2Rating / product2.price
                  const p1Stock = product1.stock
                  const p2Stock = product2.stock
                  
                  let recommended = null
                  let reason = ""
                  let IconComponent = null

                  // Case 1: High price + Low rating vs Low price + High rating
                  if (product1.price > product2.price && p1Rating < p2Rating) {
                    recommended = product2
                    reason = "Better value: Lower price with higher rating"
                    IconComponent = TrendingUp
                  }
                  else if (product2.price > product1.price && p2Rating < p1Rating) {
                    recommended = product1
                    reason = "Better value: Lower price with higher rating"
                    IconComponent = TrendingUp
                  }
                  // Case 2: High price + High rating vs Low price + Low rating
                  else if (product1.price > product2.price && p1Rating > p2Rating) {
                    if (priceDiff / product1.price < 0.3) { // Less than 30% price difference
                      recommended = product1
                      reason = "Premium choice: Better quality worth the extra cost"
                      IconComponent = Award
                    } else {
                      recommended = product2
                      reason = "Budget-friendly: Significant savings, acceptable quality"
                      IconComponent = DollarSign
                    }
                  }
                  else if (product2.price > product1.price && p2Rating > p1Rating) {
                    if (priceDiff / product2.price < 0.3) {
                      recommended = product2
                      reason = "Premium choice: Better quality worth the extra cost"
                      IconComponent = Award
                    } else {
                      recommended = product1
                      reason = "Budget-friendly: Significant savings, acceptable quality"
                      IconComponent = DollarSign
                    }
                  }
                  // Case 3: Similar price, different ratings
                  else if (Math.abs(priceDiff) < product1.price * 0.1) {
                    if (Math.abs(p1Rating - p2Rating) > 0.5) {
                      recommended = betterRated
                      reason = "Clear winner: Similar price but significantly better rated"
                      IconComponent = Star
                    } else if (p1Stock !== p2Stock) {
                      recommended = moreStock
                      reason = "Better availability: Similar quality and price, more in stock"
                      IconComponent = Package
                    }
                  }
                  // Case 4: Best value for money
                  else if (p1Value > p2Value * 1.2) {
                    recommended = product1
                    reason = "Best value: Highest quality per dollar spent"
                    IconComponent = Zap
                  }
                  else if (p2Value > p1Value * 1.2) {
                    recommended = product2
                    reason = "Best value: Highest quality per dollar spent"
                    IconComponent = Zap
                  }
                  // Case 5: Stock consideration
                  else if (p1Stock < 5 && p2Stock > 10) {
                    recommended = product2
                    reason = "Better availability: Low stock alert on alternative"
                    IconComponent = AlertTriangle
                  }
                  else if (p2Stock < 5 && p1Stock > 10) {
                    recommended = product1
                    reason = "Better availability: Low stock alert on alternative"
                    IconComponent = AlertTriangle
                  }
                  // Default: Recommend cheaper with decent rating
                  else {
                    recommended = cheaperProduct
                    reason = "Safe choice: More affordable option"
                    IconComponent = CheckCircle
                  }

                  return { recommended, reason, IconComponent }
                }

                const recommendation = getRecommendation()

                return (
                  <>
                    <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Quick Comparison
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Price Difference</p>
                          <p className="text-2xl font-bold text-purple-600">${priceDiff.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mt-1">{cheaperProduct.name} is cheaper</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">Better Rated</p>
                          <p className="text-2xl font-bold text-yellow-600">{(betterRated.averageRating || 0).toFixed(1)} ⭐</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{betterRated.name}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-sm text-gray-600 mb-1">More Available</p>
                          <p className="text-2xl font-bold text-green-600">{moreStock.stock} units</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{moreStock.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    {recommendation.recommended && recommendation.IconComponent && (
                      <div className="mt-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl relative overflow-hidden border border-slate-700">
                        <div className="absolute top-0 right-0 opacity-5">
                          <recommendation.IconComponent className="w-40 h-40 text-white" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-blue-600 rounded-xl">
                                  <recommendation.IconComponent className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Our Recommendation</h3>
                              </div>
                              <p className="text-slate-300 text-base">{recommendation.reason}</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">We recommend</p>
                              <p className="text-2xl font-bold text-gray-900 mb-1">{recommendation.recommended.name}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-blue-600">${recommendation.recommended.price.toFixed(2)}</span>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-lg font-semibold text-gray-900">{(recommendation.recommended.averageRating || 0).toFixed(1)}</span>
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleAddToCart(recommendation.recommended)
                                setShowCompareModal(false)
                              }}
                              disabled={recommendation.recommended.stock === 0}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Quick View</h2>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={quickViewProduct.imageUrl || "/placeholder.svg"}
                    alt={quickViewProduct.name}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  {quickViewProduct.featured && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold">
                      <Star className="w-4 h-4" fill="currentColor" />
                      Featured Product
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    {quickViewProduct.category}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{quickViewProduct.name}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <StarRating rating={quickViewProduct.averageRating || 0} readonly size={20} />
                    <span className="text-lg font-semibold text-gray-600">
                      {quickViewProduct.averageRating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({quickViewProduct.totalRatings || 0} reviews)
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{quickViewProduct.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${quickViewProduct.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      quickViewProduct.stock > 10 
                        ? "bg-green-100 text-green-700" 
                        : quickViewProduct.stock > 0 
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} in stock` : "Out of Stock"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        handleAddToCart(quickViewProduct)
                        setQuickViewProduct(null)
                      }}
                      disabled={quickViewProduct.stock === 0}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {quickViewProduct.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    <button
                      onClick={() => {
                        handleProductClick(quickViewProduct)
                        setQuickViewProduct(null)
                      }}
                      className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>Secure checkout guaranteed</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                      <span>30-day easy returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
