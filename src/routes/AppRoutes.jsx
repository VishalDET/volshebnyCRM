import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import MainLayout from '@layouts/MainLayout'
import AuthLayout from '@layouts/AuthLayout'

// Auth Pages
import Login from '@pages/auth/Login'

// Dashboard
import Dashboard from '@pages/dashboard/Dashboard'

// Queries
import QueryList from '@pages/queries/QueryList'
import CreateQuery from '@pages/queries/CreateQuery'
import EditQuery from '@pages/queries/EditQuery'
import ViewQuery from '@pages/queries/ViewQuery'
import ConfirmQuery from '@pages/queries/ConfirmQuery'

// Query Details
import DetailsForm from '@pages/queryDetails/DetailsForm'
import PaxDetails from '@pages/queryDetails/PaxDetails'

// Service Voucher
import ServiceVoucher from '@pages/serviceVoucher/ServiceVoucher'

// Client Invoices
import ClientInvoiceList from '@pages/clientInvoices/ClientInvoiceList'
import CreateClientInvoice from '@pages/clientInvoices/CreateClientInvoice'
import AddClientPayment from '@pages/clientInvoices/AddClientPayment'

// Supplier Invoices
import SupplierInvoiceList from '@pages/supplierInvoices/SupplierInvoiceList'
import CreateSupplierInvoice from '@pages/supplierInvoices/CreateSupplierInvoice'
import AddSupplierPayment from '@pages/supplierInvoices/AddSupplierPayment'

// Finance
import FinanceSummary from '@pages/finance/FinanceSummary'

// Masters
import MastersDashboard from '@pages/masters/MastersDashboard'
import CountryMaster from '@pages/masters/CountryMaster'
import DestinationMaster from '@pages/masters/DestinationMaster'
import CurrencyMaster from '@pages/masters/CurrencyMaster'
import CreditCardMaster from '@pages/masters/CreditCardMaster'
import ServiceTypeMaster from '@pages/masters/ServiceTypeMaster'
import SupplierMaster from '@pages/masters/SupplierMaster'
import ClientMaster from '@pages/masters/ClientMaster'
import HandlerMaster from '@pages/masters/HandlerMaster'

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, initialized } = useAuth()

    if (!initialized) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <MainLayout>{children}</MainLayout>
}

/**
 * Public Route Component (redirects to dashboard if authenticated)
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, initialized } = useAuth()

    if (!initialized) {
        return <div>Loading...</div>
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <AuthLayout>{children}</AuthLayout>
}

/**
 * App Routes Component
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Queries */}
            <Route path="/queries" element={<ProtectedRoute><QueryList /></ProtectedRoute>} />
            <Route path="/queries/create" element={<ProtectedRoute><CreateQuery /></ProtectedRoute>} />
            <Route path="/queries/viewQuery/:id" element={<ProtectedRoute><ViewQuery /></ProtectedRoute>} />
            <Route path="/queries/edit/:id" element={<ProtectedRoute><EditQuery /></ProtectedRoute>} />
            <Route path="/queries/:id" element={<ProtectedRoute><ViewQuery /></ProtectedRoute>} />
            <Route path="/queries/:id/confirm" element={<ProtectedRoute><ConfirmQuery /></ProtectedRoute>} />
            <Route path="/queries/:id/details" element={<ProtectedRoute><DetailsForm /></ProtectedRoute>} />
            <Route path="/queries/:id/pax" element={<ProtectedRoute><PaxDetails /></ProtectedRoute>} />

            {/* Service Vouchers */}
            <Route path="/service-voucher/:id" element={<ProtectedRoute><ServiceVoucher /></ProtectedRoute>} />

            {/* Client Invoices */}
            <Route path="/invoices/client" element={<ProtectedRoute><ClientInvoiceList /></ProtectedRoute>} />
            <Route path="/invoices/client/create" element={<ProtectedRoute><CreateClientInvoice /></ProtectedRoute>} />
            <Route path="/invoices/client/:id/payment" element={<ProtectedRoute><AddClientPayment /></ProtectedRoute>} />

            {/* Supplier Invoices */}
            <Route path="/invoices/supplier" element={<ProtectedRoute><SupplierInvoiceList /></ProtectedRoute>} />
            <Route path="/invoices/supplier/create" element={<ProtectedRoute><CreateSupplierInvoice /></ProtectedRoute>} />
            <Route path="/invoices/supplier/:id/payment" element={<ProtectedRoute><AddSupplierPayment /></ProtectedRoute>} />

            {/* Finance */}
            <Route path="/finance" element={<ProtectedRoute><FinanceSummary /></ProtectedRoute>} />

            {/* Masters */}
            <Route path="/masters" element={<ProtectedRoute><MastersDashboard /></ProtectedRoute>} />
            <Route path="/masters/countries" element={<ProtectedRoute><CountryMaster /></ProtectedRoute>} />
            <Route path="/masters/destinations" element={<ProtectedRoute><DestinationMaster /></ProtectedRoute>} />
            <Route path="/masters/currencies" element={<ProtectedRoute><CurrencyMaster /></ProtectedRoute>} />
            <Route path="/masters/credit-cards" element={<ProtectedRoute><CreditCardMaster /></ProtectedRoute>} />
            <Route path="/masters/service-types" element={<ProtectedRoute><ServiceTypeMaster /></ProtectedRoute>} />
            <Route path="/masters/suppliers" element={<ProtectedRoute><SupplierMaster /></ProtectedRoute>} />
            <Route path="/masters/clients" element={<ProtectedRoute><ClientMaster /></ProtectedRoute>} />
            <Route path="/masters/handlers" element={<ProtectedRoute><HandlerMaster /></ProtectedRoute>} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default AppRoutes
