import axiosInstance from '@config/axiosConfig'

/**
 * Get financial summary
 */
export const getFinanceSummary = async (filters = {}) => {
    return await axiosInstance.get('/finance/summary', { params: filters })
}

/**
 * Get revenue report
 */
export const getRevenueReport = async (startDate, endDate) => {
    return await axiosInstance.get('/finance/revenue', {
        params: { startDate, endDate }
    })
}

/**
 * Get expense report
 */
export const getExpenseReport = async (startDate, endDate) => {
    return await axiosInstance.get('/finance/expenses', {
        params: { startDate, endDate }
    })
}

/**
 * Get profit/loss statement
 */
export const getProfitLossStatement = async (startDate, endDate) => {
    return await axiosInstance.get('/finance/profit-loss', {
        params: { startDate, endDate }
    })
}

/**
 * Get outstanding payments
 */
export const getOutstandingPayments = async () => {
    return await axiosInstance.get('/finance/outstanding')
}

/**
 * Get payment history
 */
export const getPaymentHistory = async (filters = {}) => {
    return await axiosInstance.get('/finance/payment-history', { params: filters })
}

/**
 * Get cash flow report
 */
export const getCashFlowReport = async (startDate, endDate) => {
    return await axiosInstance.get('/finance/cash-flow', {
        params: { startDate, endDate }
    })
}

/**
 * Export financial report
 */
export const exportFinancialReport = async (reportType, format = 'pdf') => {
    return await axiosInstance.get(`/finance/export/${reportType}`, {
        params: { format },
        responseType: 'blob'
    })
}

/**
 * Get financial dashboard data
 */
export const getFinanceDashboard = async () => {
    return await axiosInstance.get('/finance/dashboard')
}
