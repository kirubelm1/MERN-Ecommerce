import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search } from "lucide-react"
import Button from "../components/ui/Button"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate("/products")}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            <Search className="w-5 h-5" />
            Browse Products
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="mailto:support@example.com" className="text-blue-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  )
}