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
  const authStorage = localStorage.getItem("auth-storage")
  if (authStorage) {
    const { state } = JSON.parse(authStorage)
    if (state?.user?.token) {
      ;(config.headers as any) = {
        ...(config.headers as any),
        Authorization: `Bearer ${state.user.token}`,
      }
    }
  }
  return config
})

export default api
