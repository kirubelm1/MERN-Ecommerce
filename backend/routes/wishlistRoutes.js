import express from "express"
import User from "../models/User.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Get user's wishlist
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist")
    res.json(user.wishlist || [])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add product to wishlist
router.post("/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ message: "Product already in wishlist" })
    }
    
    user.wishlist.push(req.params.productId)
    await user.save()
    
    const updatedUser = await User.findById(req.user._id).populate("wishlist")
    res.json(updatedUser.wishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Remove product from wishlist
router.delete("/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId)
    await user.save()
    
    const updatedUser = await User.findById(req.user._id).populate("wishlist")
    res.json(updatedUser.wishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
