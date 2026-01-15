import axiosInstance from '@config/axiosConfig'

/**
 * Get all users
 */
export const getAllUsers = async () => {
    return await axiosInstance.get('/users')
}

/**
 * Create a new user
 * @param {Object} userData - { name, email, password, role }
 */
export const createUser = async (userData) => {
    return await axiosInstance.post('/users', userData)
}

/**
 * Update a user
 * @param {string} uid - User ID
 * @param {Object} userData - { name, role, ... }
 */
export const updateUser = async (uid, userData) => {
    return await axiosInstance.put(`/users/${uid}`, userData)
}

/**
 * Delete a user
 * @param {string} uid - User ID
 */
export const deleteUser = async (uid) => {
    return await axiosInstance.delete(`/users/${uid}`)
}
