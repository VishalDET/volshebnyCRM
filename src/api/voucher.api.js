import axiosInstance from '@config/axiosConfig'

/**
 * Get all vouchers
 */
export const getAllVouchers = async (filters = {}) => {
    return await axiosInstance.get('/vouchers', { params: filters })
}

/**
 * Get voucher by ID
 */
export const getVoucherById = async (id) => {
    return await axiosInstance.get(`/vouchers/${id}`)
}

/**
 * Get vouchers for a query
 */
export const getVouchersByQuery = async (queryId) => {
    return await axiosInstance.get(`/vouchers/query/${queryId}`)
}

/**
 * Create service voucher
 */
export const createVoucher = async (data) => {
    return await axiosInstance.post('/vouchers', data)
}

/**
 * Update voucher
 */
export const updateVoucher = async (id, data) => {
    return await axiosInstance.put(`/vouchers/${id}`, data)
}

/**
 * Delete voucher
 */
export const deleteVoucher = async (id) => {
    return await axiosInstance.delete(`/vouchers/${id}`)
}

/**
 * Generate voucher PDF
 */
export const generateVoucherPDF = async (id) => {
    return await axiosInstance.get(`/vouchers/${id}/pdf`, {
        responseType: 'blob'
    })
}

/**
 * Send voucher via email
 */
export const sendVoucherEmail = async (id, emailData) => {
    return await axiosInstance.post(`/vouchers/${id}/send`, emailData)
}

/**
 * Mark voucher as confirmed
 */
export const confirmVoucher = async (id) => {
    return await axiosInstance.post(`/vouchers/${id}/confirm`)
}
