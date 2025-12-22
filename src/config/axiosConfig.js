import axios from 'axios'

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response

            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('authToken')
                    localStorage.removeItem('user')
                    window.location.href = '/login'
                    break
                case 403:
                    console.error('Access forbidden:', data.message)
                    break
                case 404:
                    console.error('Resource not found:', data.message)
                    break
                case 500:
                    console.error('Server error:', data.message)
                    break
                default:
                    console.error('API Error:', data.message)
            }
        } else if (error.request) {
            // Request made but no response received
            console.error('Network error: No response from server')
        } else {
            // Error in request setup
            console.error('Request error:', error.message)
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
