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

/**
 * Get all client invoices
 * @param {Object} filters 
 */
export const getAllClientInvoices = async (filters = {}) => {
    return await manageClientInvoice({
        id: 0,
        queryId: 0,
        clientId: 0,
        invoiceNo: "",
        ...filters,
        spType: "R"
    })
}

/**
 * Create a new client invoice
 * @param {Object} data 
 */
export const createClientInvoice = async (data) => {
    return await manageClientInvoice({
        ...data,
        spType: "C"
    })
}
