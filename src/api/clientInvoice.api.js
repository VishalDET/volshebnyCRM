import axiosInstance from '@config/axiosConfig'

/**
 * Get all client invoices
 */
export const getAllClientInvoices = async (filters = {}) => {
    return await axiosInstance.get('/invoices/client', { params: filters })
}

/**
 * Get client invoice by ID
 */
export const getClientInvoiceById = async (id) => {
    return await axiosInstance.get(`/invoices/client/${id}`)
}

/**
 * Create client invoice
 */
export const createClientInvoice = async (data) => {
    return await axiosInstance.post('/invoices/client', data)
}

/**
 * Update client invoice
 */
export const updateClientInvoice = async (id, data) => {
    return await axiosInstance.put(`/invoices/client/${id}`, data)
}

/**
 * Delete client invoice
 */
export const deleteClientInvoice = async (id) => {
    return await axiosInstance.delete(`/invoices/client/${id}`)
}

/**
 * Add payment to client invoice
 */
export const addClientPayment = async (invoiceId, paymentData) => {
    return await axiosInstance.post(`/invoices/client/${invoiceId}/payment`, paymentData)
}

/**
 * Get client invoice payments
 */
export const getClientPayments = async (invoiceId) => {
    return await axiosInstance.get(`/invoices/client/${invoiceId}/payments`)
}

/**
 * Generate client invoice PDF
 */
export const generateClientInvoicePDF = async (id) => {
    return await axiosInstance.get(`/invoices/client/${id}/pdf`, {
        responseType: 'blob'
    })
}

/**
 * Send client invoice via email
 */
export const sendClientInvoiceEmail = async (id, emailData) => {
    return await axiosInstance.post(`/invoices/client/${id}/send`, emailData)
}

/**
 * Mark client invoice as paid
 */
export const markClientInvoicePaid = async (id) => {
    return await axiosInstance.post(`/invoices/client/${id}/mark-paid`)
}

/**
 * Get client invoice statistics
 */
export const getClientInvoiceStats = async () => {
    return await axiosInstance.get('/invoices/client/stats')
}
