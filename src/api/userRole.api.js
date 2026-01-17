import axiosInstance from '@config/axiosConfig'

const defaultUserPayload = {
    id: 0,
    firstName: "string",
    lastName: "string",
    mobileNo: "string",
    companyName: "string",
    emailId: "string",
    isGSTIN: true,
    gstNumber: "string",
    address: "string",
    landmark: "string",
    authority: "string",
    countryId: 0,
    stateId: 0,
    cityId: 0,
    pincode: "string",
    createdBy: 0,
    modifiedBy: 0,
    isActive: true,
    spType: "string"
}

/**
 * Manage User (Create, Update, Delete, Read)
 * @param {Object} data - User data payload
 * @returns {Promise} Axios response
 */
export const manageUser = async (data) => {
    // Merge provided data with defaults to ensure all fields are present
    const payload = { ...defaultUserPayload, ...data }
    return await axiosInstance.post('/api/UserRole/ManageUser', payload)
}

/**
 * Manage Role (Create, Update, Delete, Read)
 * @param {Object} data - Role data payload
 * @returns {Promise} Axios response
 */
export const manageRole = async (data) => {
    return await axiosInstance.post('/api/UserRole/ManageRole', data)
}

/**
 * Get all users
 * Uses manageUser with spType 'R'
 */
export const getAllUsers = async () => {
    return await manageUser({
        id: 0,
        spType: 'R',
        isActive: true
    })
}

/**
 * Get all roles
 * Uses manageRole with spType 'READ'
 */
export const getAllRoles = async () => {
    return await manageRole({
        roleId: 0,
        spType: 'R',
        isActive: true
    })
}

/**
 * Manage User Role Mapping (Create, Read, Delete)
 * @param {Object} data - User role mapping data
 * @returns {Promise} Axios response
 */
export const manageUserRoleMapping = async (data) => {
    const payload = {
        userRoleId: 0,
        userId: 0,
        roleId: 0,
        isDeleted: false,
        spType: 'R',
        ...data
    }
    return await axiosInstance.post('/api/UserRole/ManageUserRoleMapping', payload)
}

/**
 * Get user profile by email
 * @param {string} email - User email address
 */
export const getUserProfileByEmail = async (email) => {
    return await axiosInstance.post(`/api/UserRole/GetUserProfileByEmail`, {
        emailId: email
    })
}
