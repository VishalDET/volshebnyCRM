import axiosInstance from '@config/axiosConfig'

/**
 * Get all vouchers
 */
export const getServiceVoucher = async (id) => {
    return await axiosInstance.get('/api/ServiceVoucher/GenerateVoucher/' + id)
}
