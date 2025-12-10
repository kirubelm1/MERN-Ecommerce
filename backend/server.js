// Load environment variables before other imports that depend on them
import "dotenv/config"
import express from "express"
import cors from "cors"
import session from "express-session"
import MongoStore from "connect-mongo"
import connectDB from "./config/database.js"
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import sessionRoutes from "./routes/sessionRoutes.js"

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
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/session", sessionRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
