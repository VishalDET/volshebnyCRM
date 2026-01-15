import axiosInstance from '@config/axiosConfig'

/**
 * Login user
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
    return await axiosInstance.post('/auth/login', credentials)
}

/**
 * Logout user
 */
export const logout = async () => {
    return await axiosInstance.post('/auth/logout')
}

/**
 * Refresh authentication token
 */
export const refreshToken = async () => {
    return await axiosInstance.post('/auth/refresh')
}

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    return await axiosInstance.get('/auth/me')
}

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
    return await axiosInstance.put('/auth/profile', data)
}

/**
 * Change password
 */
export const changePassword = async (data) => {
    return await axiosInstance.post('/auth/change-password', data)
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
    return await axiosInstance.post('/auth/forgot-password', { email })
}

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
    return await axiosInstance.post('/auth/reset-password', { token, newPassword })
}

/**
 * Get user profile by Firebase UID
 */
export const getUserProfile = async (uid) => {
    return await axiosInstance.get(`/users/${uid}`)
}
