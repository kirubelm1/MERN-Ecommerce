"use client"

import { useEffect } from "react"
import { useAuthStore, useWishlistStore } from "@/lib/store"

export function WishlistLoader() {
  const { user } = useAuthStore()
  const { loadWishlist } = useWishlistStore()

  useEffect(() => {
    if (user) {
      loadWishlist()
    }
  }, [user, loadWishlist])

  return null
}
