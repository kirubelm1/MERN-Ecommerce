import express from "express"
import Product from "../models/Product.js"
import { protect, admin } from "../middleware/auth.js"
import upload from "../middleware/upload.js"
import cloudinary from "../config/cloudinary.js"

const router = express.Router()

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      res.json(product)
    } else {
      res.status(404).json({ message: "Product not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create product (Admin only)
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" })
    }

    // Upload image to Cloudinary
    let result
    try {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "ecommerce-products",
            resource_type: "image",
          },
          (error, uploadResult) => {
            if (error) reject(error)
            else resolve(uploadResult)
          },
        )
        uploadStream.end(req.file.buffer)
      })
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError)
      return res.status(502).json({ message: "Image upload failed", detail: uploadError.message || uploadError.toString() })
    }

    try {
      const product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        featured: featured === "true",
        discount: Number(req.body.discount || 0),
        features: req.body.features ? JSON.parse(req.body.features) : [],
        imageUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
      })

      return res.status(201).json(product)
    } catch (dbError) {
      console.error("Product creation failed:", dbError)
      // Attempt to clean up uploaded image if product creation fails
      try {
        if (result && result.public_id) await cloudinary.uploader.destroy(result.public_id)
      } catch (cleanupErr) {
        console.error("Failed to cleanup Cloudinary asset:", cleanupErr)
      }
      return res.status(500).json({ message: "Failed to create product", detail: dbError.message || dbError.toString() })
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/products:", error)
    return res.status(500).json({ message: "Internal server error", detail: error.message || error.toString() })
  }
})

// Update product (Admin only)
router.put("/:id", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const { name, description, price, category, stock, featured } = req.body

    product.name = name || product.name
    product.description = description || product.description
    product.price = price ? Number(price) : product.price
    product.category = category || product.category
    product.stock = stock ? Number(stock) : product.stock
    product.featured = featured !== undefined ? featured === "true" : product.featured
    product.discount = req.body.discount !== undefined ? Number(req.body.discount) : product.discount
    product.features = req.body.features ? JSON.parse(req.body.features) : product.features

    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(product.cloudinaryPublicId)

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "ecommerce-products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        uploadStream.end(req.file.buffer)
      })

      product.imageUrl = result.secure_url
      product.cloudinaryPublicId = result.public_id
    }

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete product (Admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(product.cloudinaryPublicId)

    await product.deleteOne()
    res.json({ message: "Product removed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add or update rating
router.post("/:id/rating", protect, async (req, res) => {
  try {
    const { stars, review } = req.body
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    // Check if user has purchased this product and hasn't rated it yet
    const Order = (await import("../models/Order.js")).default
    const userOrders = await Order.find({
      user: req.user._id,
      status: "delivered",
    })

    let orderWithProduct = null
    let itemIndex = -1

    for (const order of userOrders) {
      const index = order.items.findIndex((item) => item.product.toString() === req.params.id)
      if (index !== -1) {
        if (order.items[index].rated) {
          return res.status(403).json({ message: "You have already rated this product" })
        }
        orderWithProduct = order
        itemIndex = index
        break
      }
    }

    if (!orderWithProduct) {
      return res.status(403).json({ message: "You can only rate products you have purchased and received" })
    }

    // Check if user already rated
    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.userId.toString() === req.user._id.toString()
    )

    if (existingRatingIndex > -1) {
      // Update existing rating
      product.ratings[existingRatingIndex].stars = Number(stars)
      product.ratings[existingRatingIndex].review = review || ""
      product.ratings[existingRatingIndex].createdAt = Date.now()
    } else {
      // Add new rating
      product.ratings.push({
        userId: req.user._id,
        stars: Number(stars),
        review: review || "",
      })
    }

    // Calculate average rating properly
    const totalStars = product.ratings.reduce((sum, r) => sum + Number(r.stars), 0)
    product.averageRating = Math.round((totalStars / product.ratings.length) * 10) / 10
    product.totalRatings = product.ratings.length

    await product.save()

    // Mark product as rated in the order
    orderWithProduct.items[itemIndex].rated = true
    await orderWithProduct.save()

    res.json({
      averageRating: product.averageRating,
      totalRatings: product.totalRatings,
      userRating: stars,
    })
  } catch (error) {
    console.error("Rating error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get product ratings
router.get("/:id/ratings", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "ratings.userId",
      "name"
    )

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({
      averageRating: product.averageRating,
      totalRatings: product.totalRatings,
      ratings: product.ratings.sort((a, b) => b.createdAt - a.createdAt),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
