import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export default function StarRating({ rating, onRate, readonly = false, size = 20 }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hover || rating) >= star
        const partial = !hover && rating > star - 1 && rating < star
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`relative transition-transform ${
              !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
          >
            {partial ? (
              <div className="relative">
                <Star
                  size={size}
                  className="text-gray-300"
                  fill="currentColor"
                />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(rating - (star - 1)) * 100}%` }}
                >
                  <Star
                    size={size}
                    className="text-yellow-400"
                    fill="currentColor"
                  />
                </div>
              </div>
            ) : (
              <Star
                size={size}
                className={filled ? "text-yellow-400" : "text-gray-300"}
                fill="currentColor"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
