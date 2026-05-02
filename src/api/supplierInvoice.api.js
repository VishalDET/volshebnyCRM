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

/**
 * Get all supplier invoices
 * @param {Object} filters 
 */
export const getAllSupplierInvoices = async (filters = {}) => {
    return await manageSupplierInvoice({
        id: 0,
        queryId: 0,
        supplierId: 0,
        invoiceNo: "",
        ...filters,
        spType: "R"
    })
}

/**
 * Create a new supplier invoice
 * @param {Object} data 
 */
export const createSupplierInvoice = async (data) => {
    return await manageSupplierInvoice({
        ...data,
        spType: "C"
    })
}
