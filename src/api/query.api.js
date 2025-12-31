import axiosInstance from '@config/axiosConfig'
import { data } from 'autoprefixer'

/**
 * Get all queries with optional filters
 */
/**
 * Manage Country (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageQuery = async (data) => {
    return await axiosInstance.post('/api/Query/ManageQuery', data)
}

/**
 * Get all queries with optional filters
 */


export const getAllQueries = async (filters = {}) => {
    return await axiosInstance.get('/queries', { params: filters })
}

/**
 * Get query by ID
 */
export const getQueryById = async (id) => {
    return await axiosInstance.get(`/queries/${id}`)
}

/**
 * Create new query
 */
export const createQuery = async (data) => {
    return await axiosInstance.post('/queries', data)
}

/**
 * Update query
 */
export const updateQuery = async (id, data) => {
    return await axiosInstance.put(`/queries/${id}`, data)
}

/**
 * Delete query
 */
export const deleteQuery = async (id) => {
    return await axiosInstance.delete(`/queries/${id}`)
}

/**
 * Confirm query
 */
export const confirmQuery = async (id, data) => {
    return await axiosInstance.post(`/queries/${id}/confirm`, data)
}

/**
 * Get query statistics
 */
export const getQueryStats = async () => {
    return await axiosInstance.get('/queries/stats')
}

/**
 * Search queries
 */
export const searchQueries = async (searchTerm) => {
    return await axiosInstance.get('/queries/search', { params: { q: searchTerm } })
}

/**
 * Get queries by status
 */
export const getQueriesByStatus = async (status) => {
    return await axiosInstance.get('/queries/status', { params: { status } })
}

/**
 * Duplicate query
 */
export const duplicateQuery = async (id) => {
    return await axiosInstance.post(`/queries/${id}/duplicate`)
}
