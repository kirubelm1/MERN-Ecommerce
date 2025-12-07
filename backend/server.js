// Load environment variables before other imports that depend on them
import "dotenv/config"
import express from "express"
import cors from "cors"
import connectDB from "./config/database.js"
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"

const app = express()

// Connect to MongoDB
connectDB()

// Seed admin user if enabled
if (process.env.SEED_ADMIN === "true") {
  import("./models/User.js").then(async ({ default: User }) => {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (!adminExists) {
      await User.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name: "Admin",
        role: "admin",
      })
      console.log("Admin user created")
    }
  })
}

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
