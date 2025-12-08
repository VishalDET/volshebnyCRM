import axiosInstance from '@config/axiosConfig'

/**
 * Get query details
 */
export const getQueryDetails = async (queryId) => {
    return await axiosInstance.get(`/details/${queryId}`)
}

/**
 * Create or update query details
 */
export const saveQueryDetails = async (queryId, data) => {
    return await axiosInstance.post(`/details/${queryId}`, data)
}

/**
 * Get passenger details for a query
 */
export const getPaxDetails = async (queryId) => {
    return await axiosInstance.get(`/details/${queryId}/pax`)
}

/**
 * Add passenger to query
 */
export const addPaxDetails = async (queryId, paxData) => {
    return await axiosInstance.post(`/details/${queryId}/pax`, paxData)
}

/**
 * Update passenger details
 */
export const updatePaxDetails = async (queryId, paxId, paxData) => {
    return await axiosInstance.put(`/details/${queryId}/pax/${paxId}`, paxData)
}

/**
 * Delete passenger
 */
export const deletePaxDetails = async (queryId, paxId) => {
    return await axiosInstance.delete(`/details/${queryId}/pax/${paxId}`)
}

/**
 * Get itinerary details
 */
export const getItinerary = async (queryId) => {
    return await axiosInstance.get(`/details/${queryId}/itinerary`)
}

/**
 * Save itinerary
 */
export const saveItinerary = async (queryId, itineraryData) => {
    return await axiosInstance.post(`/details/${queryId}/itinerary`, itineraryData)
}
