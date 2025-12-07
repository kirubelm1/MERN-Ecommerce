import express from "express"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import { protect, admin } from "../middleware/auth.js"

const router = express.Router()

router.get("/", protect, admin, async (req, res) => {
  try {
    const { timeRange = "month" } = req.query

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case "all":
        startDate = new Date(0)
        break
    }

    // Fetch all data
    const [orders, products, users] = await Promise.all([
      Order.find({ createdAt: { $gte: startDate } }).populate("items.product"),
      Product.find({}),
      User.find({ createdAt: { $gte: startDate } }),
    ])

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate previous period for growth
    const previousStartDate = new Date(startDate)
    previousStartDate.setTime(startDate.getTime() - (now.getTime() - startDate.getTime()))
    
    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    })
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const ordersGrowth = previousOrders.length > 0 ? ((orders.length - previousOrders.length) / previousOrders.length) * 100 : 0

    // Revenue by time period
    const revenueByPeriod = {}
    orders.forEach(order => {
      const date = new Date(order.createdAt)
      let key
      
      if (timeRange === "day") {
        key = date.getHours() + ":00"
      } else if (timeRange === "week" || timeRange === "month") {
        key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      } else {
        key = date.toLocaleDateString("en-US", { month: "short" })
      }
      
      if (!revenueByPeriod[key]) {
        revenueByPeriod[key] = { revenue: 0, orders: 0 }
      }
      revenueByPeriod[key].revenue += order.totalAmount
      revenueByPeriod[key].orders += 1
    })

    const revenueData = Object.entries(revenueByPeriod).map(([name, data]) => ({
      name,
      revenue: Math.round(data.revenue),
      orders: data.orders
    }))

    // Sales by category
    const categoryData = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product?.category || "Other"
        if (!categoryData[category]) {
          categoryData[category] = 0
        }
        categoryData[category] += item.quantity
      })
    })

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    }))

    // Top products
    const productSales = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString()
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              sales: 0,
              revenue: 0
            }
          }
          productSales[productId].sales += item.quantity
          productSales[productId].revenue += item.price * item.quantity
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(item => ({
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        sales: item.sales,
        revenue: item.revenue
      }))

    res.json({
      stats: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      },
      revenueData,
      categoryData: categoryChartData,
      topProducts
    })
  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
