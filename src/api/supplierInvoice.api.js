import axiosInstance from '@config/axiosConfig'

/**
 * Get all supplier invoices
 */
export const getAllSupplierInvoices = async (filters = {}) => {
    return await axiosInstance.get('/invoices/supplier', { params: filters })
}

/**
 * Get supplier invoice by ID
 */
export const getSupplierInvoiceById = async (id) => {
    return await axiosInstance.get(`/invoices/supplier/${id}`)
}

/**
 * Create supplier invoice
 */
export const createSupplierInvoice = async (data) => {
    return await axiosInstance.post('/invoices/supplier', data)
}

/**
 * Update supplier invoice
 */
export const updateSupplierInvoice = async (id, data) => {
    return await axiosInstance.put(`/invoices/supplier/${id}`, data)
}

/**
 * Delete supplier invoice
 */
export const deleteSupplierInvoice = async (id) => {
    return await axiosInstance.delete(`/invoices/supplier/${id}`)
}

/**
 * Add payment to supplier invoice
 */
export const addSupplierPayment = async (invoiceId, paymentData) => {
    return await axiosInstance.post(`/invoices/supplier/${invoiceId}/payment`, paymentData)
}

/**
 * Get supplier invoice payments
 */
export const getSupplierPayments = async (invoiceId) => {
    return await axiosInstance.get(`/invoices/supplier/${invoiceId}/payments`)
}

/**
 * Generate supplier invoice PDF
 */
export const generateSupplierInvoicePDF = async (id) => {
    return await axiosInstance.get(`/invoices/supplier/${id}/pdf`, {
        responseType: 'blob'
    })
}

/**
 * Mark supplier invoice as paid
 */
export const markSupplierInvoicePaid = async (id) => {
    return await axiosInstance.post(`/invoices/supplier/${id}/mark-paid`)
}

/**
 * Get supplier invoice statistics
 */
export const getSupplierInvoiceStats = async () => {
    return await axiosInstance.get('/invoices/supplier/stats')
}
