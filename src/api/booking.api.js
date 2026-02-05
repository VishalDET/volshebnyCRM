import axiosInstance from '@config/axiosConfig'

/**
 * Get all service bookings
 * @param {Object} filters - Optional filters
 */
export const getAllServiceBookings = async (filters = {}) => {
    const payload = {
        serviceId: 0,
        bookingId: "",
        handlerId: 0,
        serviceTypeId: 0,
        supplierId: 0,
        clientId: 0,
        countryId: 0,
        cityId: 0,
        bookingDate: null,
        serviceDate: null,
        checkOutDate: null,
        nights: 0,
        serviceTime: "00:00:00",
        source: "",
        destination: "",
        isLunch: false,
        isDinner: false,
        adults: 0,
        children: 0,
        currencyId: 0,
        paymentOption: "",
        taxOption: "",
        cost: 0,
        serviceCharge: 0,
        remittanceCharge: 0,
        rateOfExchange: 0,
        gstAmount: 0,
        totalAmount: 0,
        remarks: "",
        roleId: 0,
        createdBy: 0,
        modifiedBy: 0,
        isActive: true,
        ...filters,
        spType: "R"
    }
    return await manageMiscService(payload)
}

/**
 * Manage Miscellaneous Service Booking
 * @param {Object} data - Booking payload
 */
export const manageMiscService = async (data) => {
    return await axiosInstance.post('/api/MiscService/ManageMiscService', data)
}

/**
 * Create a new service booking
 * @param {Object} data - Booking payload
 */
export const createServiceBooking = async (data) => {
    return await manageMiscService(data)
}
/**
 * Get service booking by ID
 * @param {number|string} id - Booking ID
 */
export const getServiceBookingById = async (id) => {
    const payload = {
        serviceId: parseInt(id),
        bookingId: "",
        handlerId: 0,
        serviceTypeId: 0,
        supplierId: 0,
        clientId: 0,
        countryId: 0,
        cityId: 0,
        bookingDate: "2026-01-28T07:12:59.536Z",
        serviceDate: "2026-01-28T07:12:59.536Z",
        checkOutDate: "2026-01-28T07:12:59.536Z",
        nights: 0,
        serviceTime: "00:00:00",
        source: "",
        destination: "",
        isLunch: false,
        isDinner: false,
        adults: 0,
        children: 0,
        currencyId: 0,
        paymentOption: "",
        taxOption: "",
        cost: 0,
        serviceCharge: 0,
        remittanceCharge: 0,
        rateOfExchange: 0,
        gstAmount: 0,
        totalAmount: 0,
        remarks: "",
        roleId: 0,
        createdBy: 0,
        modifiedBy: 0,
        isActive: true,
        spType: "E"
    }
    return await manageMiscService(payload)
}
