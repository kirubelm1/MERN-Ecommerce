"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, ArrowUp, ArrowDown } from "lucide-react"
import api from "../config/api"
import { useAuthStore } from "../store/authStore"

export default function Analytics() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState("month")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
      return
    }
    fetchAnalytics()
  }, [user, navigate, timeRange])

  const [revenueData, setRevenueData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/analytics?timeRange=${timeRange}`)
      
      setStats(data.stats)
      setRevenueData(data.revenueData)
      setCategoryData(data.categoryData)
      setTopProducts(data.topProducts)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex gap-2">
            {["day", "week", "month", "year", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUp className="w-4 h-4" />
                {stats.revenueGrowth}%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUp className="w-4 h-4" />
                {stats.ordersGrowth}%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Products</h2>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">${product.revenue.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No sales data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
