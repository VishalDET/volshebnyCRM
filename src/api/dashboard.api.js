import axiosInstance from "../config/axiosConfig";

/**
 * Get general dashboard statistics (Query stats, Client Invoices, Supplier Invoices)
 */
export const getGeneralStats = () => {
    return axiosInstance.get('/api/dashboard/general');
};

/**
 * Get client-wise tour and revenue statistics
 */
export const getClientStats = () => {
    return axiosInstance.get('/api/dashboard/client-stats');
};

/**
 * Get supplier-wise expenditure and country-wise stats
 */
export const getSupplierStats = () => {
    return axiosInstance.get('/api/dashboard/supplier-stats');
};

/**
 * Get detailed financial report (Revenue, Expenditure, Profit, GST)
 * @param {Object} payload { filterType: 'All'|'Yearly'|'Monthly', year: number, month: number }
 */
export const getFinancialReport = (payload = { filterType: "All", year: 0, month: 0 }) => {
    return axiosInstance.post('/api/dashboard/financial-report', payload);
};
