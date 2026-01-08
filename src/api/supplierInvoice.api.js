import axiosInstance from '@config/axiosConfig'

/**
 * Manage supplier invoices (Create, Update, Delete etc.)
 * @param {Object} data - Payload with id, queryId, spType, etc.
 */
export const manageSupplierInvoice = async (data) => {
    return await axiosInstance.post('/api/Invoice/SupplierInvoice', data)
}

/**
 * Get single supplier invoice by ID
 * @param {number|string} id 
 */
export const getSupplierInvoiceById = async (id) => {
    return await axiosInstance.get(`/api/Invoice/GetSupplierInvoiceById/${id}`)
}
