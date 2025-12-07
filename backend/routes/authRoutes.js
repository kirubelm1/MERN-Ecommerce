import express from "express"
import User from "../models/User.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const user = await User.create({
      email,
      password,
      name,
      role: "customer",
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.generateToken(),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: user.generateToken(),
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user profile
router.get("/profile", protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  })
})

// Get wishlist
router.get("/wishlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist")
    res.json(user.wishlist || [])
  } catch (error) {
    console.error("Wishlist get error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Add to wishlist
router.post("/wishlist/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user.wishlist) {
      user.wishlist = []
    }
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId)
      await user.save({ validateBeforeSave: false })
    }
    res.json({ message: "Added to wishlist" })
  } catch (error) {
    console.error("Wishlist add error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Remove from wishlist
router.delete("/wishlist/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user.wishlist) {
      user.wishlist = []
    }
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId)
    await user.save({ validateBeforeSave: false })
    res.json({ message: "Removed from wishlist" })
  } catch (error) {
    console.error("Wishlist remove error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
