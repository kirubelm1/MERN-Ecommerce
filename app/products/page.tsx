"use client"

import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, Heart } from "lucide-react"
import { api, type Product } from "@/lib/api"
import { useCartStore, useWishlistStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get<Product[]>("/products")
        setProducts(data)
        const max = Math.max(...data.map((p) => p.price), 1000)
        setMaxPrice(Math.ceil(max / 100) * 100)
        setPriceRange([0, Math.ceil(max / 100) * 100])
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [toast])

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }
    })

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently unavailable.",
        variant: "destructive",
      })
      return
    }
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">All Products</h1>
        <p className="text-muted-foreground">Browse our complete collection</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Price Range</Label>
              <span className="text-sm text-muted-foreground">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              min={0}
              max={maxPrice}
              step={10}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="w-full"
            />
          </div>
        </Card>

        {/* Active Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              ${priceRange[0]} - ${priceRange[1]}
              <button onClick={() => setPriceRange([0, maxPrice])} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">No products found</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
              setPriceRange([0, maxPrice])
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? "product" : "products"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAndSortedProducts.map((product) => (
              <Card key={product._id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {product.images && product.images.length > 1 ? (
                    <div className="relative h-full w-full">
                      <img
                        src={product.images[0]?.url || product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {product.images.slice(0, 3).map((_, index) => (
                          <div key={index} className="w-2 h-2 bg-white/60 rounded-full" />
                        ))}
                        {product.images.length > 3 && (
                          <span className="text-xs bg-black/50 text-white px-1 rounded">+{product.images.length - 3}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <img
                      src={
                        product.imageUrl ||
                        `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                      }
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  {product.featured && <Badge className="absolute top-2 right-2">Featured</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-background/80 hover:bg-background"
                    onClick={() => handleWishlistToggle(product)}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product._id) ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">{product.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                      {product.stock > 0 && product.stock <= 10 && (
                        <span className="text-xs text-orange-600">Only {product.stock} left</span>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
