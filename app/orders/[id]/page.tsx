"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, CreditCard, Calendar } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface Order {
  _id: string
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  subtotal: number
  shippingCost: number
  total: number
  status: string
  isPaid: boolean
  paidAt?: string
  deliveredAt?: string
  createdAt: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders")
      return
    }

    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [user, params.id, router])

  const fetchOrder = async (orderId: string) => {
    try {
      const { data } = await api.get<Order>(`/orders/${orderId}`)
      console.log("Order data:", data)
      console.log("Order items:", data.items)
      setOrder(data)
    } catch (error: any) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load order",
        variant: "destructive",
      })
      router.push("/orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusSteps = (status: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"]
    const currentIndex = steps.indexOf(status)
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusSteps = getStatusSteps(order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
            {order.status.toUpperCase()}
          </Badge>
        </div>

        {/* Order Status Timeline */}
        {order.status !== "cancelled" && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.name} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.completed ? "✓" : index + 1}
                      </div>
                      <span className="text-xs mt-2 capitalize">{step.name}</span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${step.completed ? "bg-primary" : "bg-muted"}`}
                        style={{ marginTop: "-1.5rem" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} items in this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.imageUrl ||
                          `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.name)}`
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  {index < order.items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {order.shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${order.shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.isPaid ? "default" : "destructive"}>{order.isPaid ? "Paid" : "Unpaid"}</Badge>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid on</span>
                    <span className="text-xs">
                      {new Date(order.paidAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
