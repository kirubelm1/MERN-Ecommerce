import axios from "axios"

const API_URL = "http://localhost:5000/api"

// Do not set a global Content-Type header here. When sending FormData (file uploads)
// the browser/axios will set the correct multipart boundary. A global
// "Content-Type: application/json" prevents multipart requests from being parsed by multer.
const api = axios.create({
  baseURL: API_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user")
  if (user) {
    const { token } = JSON.parse(user)
    // Merge Authorization header safely while keeping existing headers.
    // Use `any` here because AxiosRequestHeaders is not a plain object type in TS types.
    ;(config.headers as any) = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

export default api
