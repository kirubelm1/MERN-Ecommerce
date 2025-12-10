import express from "express"

const router = express.Router()

// Get session info
router.get("/", (req, res) => {
  res.json({
    sessionId: req.sessionID,
    isAuthenticated: !!req.session.userId,
    userId: req.session.userId || null,
    userRole: req.session.userRole || null
  })
})

// Create session (login)
router.post("/create", (req, res) => {
  const { userId, userRole } = req.body
  
  req.session.userId = userId
  req.session.userRole = userRole
  
  res.json({
    message: "Session created",
    sessionId: req.sessionID
  })
})

// Destroy session (logout)
router.post("/destroy", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" })
    }
    res.clearCookie("connect.sid")
    res.json({ message: "Session destroyed" })
  })
})

export default router