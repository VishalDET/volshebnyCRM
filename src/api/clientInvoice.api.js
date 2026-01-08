import axiosInstance from '@config/axiosConfig'

/**
 * Manage client invoices (Create, Update, Delete etc.)
 * @param {Object} data - Payload with id, queryId, spType, etc.
 */
export const manageClientInvoice = async (data) => {
    return await axiosInstance.post('/api/Invoice/ClientInvoice', data)
}

/**
 * Get single client invoice by ID
 * @param {number|string} id 
 */
export const getClientInvoiceById = async (id) => {
    return await axiosInstance.get(`/api/Invoice/GetClientInvoiceById/${id}`)
}
