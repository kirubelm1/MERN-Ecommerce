import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  // Development bypass: when DISABLE_AUTH=true, inject a dev user
  if (process.env.DISABLE_AUTH && process.env.DISABLE_AUTH.toLowerCase() === "true") {
    try {
      const devEmail = process.env.ADMIN_EMAIL || "dev@local"
      let devUser = await User.findOne({ email: devEmail })
      if (!devUser) {
        const devPassword = process.env.ADMIN_PASSWORD || "devpassword"
        devUser = await User.create({
          email: devEmail,
          password: devPassword,
          name: process.env.ADMIN_NAME || "Dev User",
          role: "admin",
        })
      }
      req.user = devUser
      next()
      return
    } catch (err) {
      console.error("Error creating or finding dev user:", err)
      return res.status(500).json({ message: "Server error in auth bypass" })
    }
  }

  let token

  // Accept token from Authorization header, query param, or body (helpful for testing)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.query && req.query.token) {
    token = req.query.token
  } else if (req.body && req.body.token) {
    token = req.body.token
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select("-password")
    next()
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" })
  }
}

export const admin = (req, res, next) => {
  // Accept admin role in a case-insensitive way and ensure req.user exists
  if (req.user && typeof req.user.role === "string" && req.user.role.toLowerCase() === "admin") {
    return next()
  }

  return res.status(403).json({ message: "Not authorized as admin" })
}
