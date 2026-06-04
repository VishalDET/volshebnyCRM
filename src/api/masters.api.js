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
    return await axiosInstance.post('api/SupplierService/ManageDestinationMaster', data)
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
    return await axiosInstance.post('/api/SupplierService/ManageServiceMaster', data)
}

/**
 * Manage Supplier (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType (C, R, U, D)
 */
export const manageSupplier = async (data) => {
    return await axiosInstance.post('/api/SupplierService/ManageSupplierMaster', data)
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
const defaultOfficePayload = {
    officeId: 0,
    officeName: "string",
    currencyId: 0,
    countryId: 0,
    cityId: 0,
    address: "string",
    createdBy: 0,
    modifiedBy: 0,
    isActive: true,
    spType: "R",
    contacts: [
        {
            contactId: 0,
            officeId: 0,
            contactName: "string",
            contactNumber: "string",
            contactEmail: "string",
            spType: "string"
        }
    ]
}

/**
 * Manage Office (Create, Read, Update, Delete)
 * @param {Object} data - Payload with spType
 *   spType 'R' = fetch all offices
 *   spType 'E' = fetch single office by officeId
 *   spType 'C' = create, 'U' = update, 'D' = delete
 */
export const manageOffice = async (data) => {
    const payload = { ...defaultOfficePayload, ...data }
    return await axiosInstance.post('/api/Office/ManageOfficeMaster', payload)
}
