import axiosInstance from '@config/axiosConfig'

// ============ COUNTRIES ============

/**
 * Manage Country (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageCountry = async (data) => {
    return await axiosInstance.post('/api/Country/ManageCountryMaster', data)
}

export const manageCity = async (data) => {
    return await axiosInstance.post('/api/Country/ManageCityMaster', data)
}
// ============ DESTINATIONS ============

/**
 * Manage Destination (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageDestination = async (data) => {
    return await axiosInstance.post('/ManageDestinationMaster', data)
}


/**
 * Manage Creditcards (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageCreditcards = async (data) => {
    return await axiosInstance.post('/api/CreditCardBank/ManageCreditCardBank', data)
}

/**
 * Manage ServiceType (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageServiceType = async (data) => {
    return await axiosInstance.post('/ManageServiceMaster', data)
}

/**
 * Manage Supplier (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageSupplier = async (data) => {
    return await axiosInstance.post('/ManageSupplierMaster', data)
}

/**
 * Manage Currency (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageCurrency = async (data) => {
    return await axiosInstance.post('/api/Country/ManageCurrencyMaster', data)
}


/**
 * Manage Handler (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageHandler = async (data) => {
    return await axiosInstance.post('/api/Handler/ManageHandler', data)
}

/**
 * Manage Client (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageClient = async (data) => {
    return await axiosInstance.post('/api/Client/ManageClient', data)
}




// ============ HOTELS ============

/**
 * Get all hotels
 */
export const getAllHotels = async (filters = {}) => {
    return await axiosInstance.get('/masters/hotels', { params: filters })
}
