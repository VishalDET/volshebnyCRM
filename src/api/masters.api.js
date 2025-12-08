import axiosInstance from '@config/axiosConfig'

// ============ DESTINATIONS ============

/**
 * Get all destinations
 */
export const getAllDestinations = async () => {
    return await axiosInstance.get('/masters/destinations')
}

/**
 * Create destination
 */
export const createDestination = async (data) => {
    return await axiosInstance.post('/masters/destinations', data)
}

/**
 * Update destination
 */
export const updateDestination = async (id, data) => {
    return await axiosInstance.put(`/masters/destinations/${id}`, data)
}

/**
 * Delete destination
 */
export const deleteDestination = async (id) => {
    return await axiosInstance.delete(`/masters/destinations/${id}`)
}

// ============ HOTELS ============

/**
 * Get all hotels
 */
export const getAllHotels = async (filters = {}) => {
    return await axiosInstance.get('/masters/hotels', { params: filters })
}

/**
 * Get hotel by ID
 */
export const getHotelById = async (id) => {
    return await axiosInstance.get(`/masters/hotels/${id}`)
}

/**
 * Create hotel
 */
export const createHotel = async (data) => {
    return await axiosInstance.post('/masters/hotels', data)
}

/**
 * Update hotel
 */
export const updateHotel = async (id, data) => {
    return await axiosInstance.put(`/masters/hotels/${id}`, data)
}

/**
 * Delete hotel
 */
export const deleteHotel = async (id) => {
    return await axiosInstance.delete(`/masters/hotels/${id}`)
}

// ============ SIGHTSEEING ============

/**
 * Get all sightseeing options
 */
export const getAllSightseeing = async (filters = {}) => {
    return await axiosInstance.get('/masters/sightseeing', { params: filters })
}

/**
 * Create sightseeing
 */
export const createSightseeing = async (data) => {
    return await axiosInstance.post('/masters/sightseeing', data)
}

/**
 * Update sightseeing
 */
export const updateSightseeing = async (id, data) => {
    return await axiosInstance.put(`/masters/sightseeing/${id}`, data)
}

/**
 * Delete sightseeing
 */
export const deleteSightseeing = async (id) => {
    return await axiosInstance.delete(`/masters/sightseeing/${id}`)
}

// ============ RATES ============

/**
 * Get all rates
 */
export const getAllRates = async (filters = {}) => {
    return await axiosInstance.get('/masters/rates', { params: filters })
}

/**
 * Get rate by ID
 */
export const getRateById = async (id) => {
    return await axiosInstance.get(`/masters/rates/${id}`)
}

/**
 * Create rate
 */
export const createRate = async (data) => {
    return await axiosInstance.post('/masters/rates', data)
}

/**
 * Update rate
 */
export const updateRate = async (id, data) => {
    return await axiosInstance.put(`/masters/rates/${id}`, data)
}

/**
 * Delete rate
 */
export const deleteRate = async (id) => {
    return await axiosInstance.delete(`/masters/rates/${id}`)
}

/**
 * Get rates by destination
 */
export const getRatesByDestination = async (destinationId) => {
    return await axiosInstance.get(`/masters/rates/destination/${destinationId}`)
}

/**
 * Get rates by hotel
 */
export const getRatesByHotel = async (hotelId) => {
    return await axiosInstance.get(`/masters/rates/hotel/${hotelId}`)
}
