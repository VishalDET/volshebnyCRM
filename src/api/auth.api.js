import axiosInstance from '@config/axiosConfig'

/**
 * Login user
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
    // Map email to emailId for the new API
    const payload = {
        emailId: credentials.email,
        password: credentials.password
    }
    return await axiosInstance.post('/api/Auth/Login', payload)
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

