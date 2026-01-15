import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import MainLayout from '@layouts/MainLayout'
import AuthLayout from '@layouts/AuthLayout'
import Loader from '@components/Loader'

// Auth Pages
const Login = lazy(() => import('@pages/auth/Login'))

// Dashboard
const Dashboard = lazy(() => import('@pages/dashboard/Dashboard'))
const UserProfile = lazy(() => import('@pages/profile/UserProfile'))

// Queries
const QueryList = lazy(() => import('@pages/queries/QueryList'))
const CreateQuery = lazy(() => import('@pages/queries/CreateQuery'))
const EditQuery = lazy(() => import('@pages/queries/EditQuery'))
const ViewQuery = lazy(() => import('@pages/queries/ViewQuery'))
const ConfirmQuery = lazy(() => import('@pages/queries/ConfirmQuery'))

// Query Details
const DetailsForm = lazy(() => import('@pages/queryDetails/DetailsForm'))
const PaxDetails = lazy(() => import('@pages/queryDetails/PaxDetails'))

// Service Voucher
const ServiceVoucher = lazy(() => import('@pages/serviceVoucher/ServiceVoucher'))

// Client Invoices
const ClientInvoiceList = lazy(() => import('@pages/clientInvoices/ClientInvoiceList'))
const CreateClientInvoice = lazy(() => import('@pages/clientInvoices/CreateClientInvoice'))
const AddClientPayment = lazy(() => import('@pages/clientInvoices/AddClientPayment'))
const InvoicePDF = lazy(() => import('@pages/clientInvoices/InvoicePDF'))

// Supplier Invoices
const SupplierInvoiceList = lazy(() => import('@pages/supplierInvoices/SupplierInvoiceList'))
const CreateSupplierInvoice = lazy(() => import('@pages/supplierInvoices/CreateSupplierInvoice'))
const AddSupplierPayment = lazy(() => import('@pages/supplierInvoices/AddSupplierPayment'))

// Finance
const FinanceSummary = lazy(() => import('@pages/finance/FinanceSummary'))

// Masters
const MastersDashboard = lazy(() => import('@pages/masters/MastersDashboard'))
const CountryMaster = lazy(() => import('@pages/masters/CountryMaster'))
const DestinationMaster = lazy(() => import('@pages/masters/DestinationMaster'))
const CurrencyMaster = lazy(() => import('@pages/masters/CurrencyMaster'))
const CreditCardMaster = lazy(() => import('@pages/masters/CreditCardMaster'))
const ServiceTypeMaster = lazy(() => import('@pages/masters/ServiceTypeMaster'))
const SupplierMaster = lazy(() => import('@pages/masters/SupplierMaster'))
const ClientMaster = lazy(() => import('@pages/masters/ClientMaster'))
const HandlerMaster = lazy(() => import('@pages/masters/HandlerMaster'))
const UserMaster = lazy(() => import('@pages/masters/UserMaster'))

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, initialized } = useAuth()

    if (!initialized) {
        return <Loader fullScreen />
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
        return <Loader fullScreen />
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
        <Suspense fallback={<Loader fullScreen />}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

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
                <Route path="/invoices/client/query/:queryId" element={<ProtectedRoute><ClientInvoiceList /></ProtectedRoute>} />
                <Route path="/invoices/client/create" element={<ProtectedRoute><CreateClientInvoice /></ProtectedRoute>} />
                <Route path="/invoices/client/create/:queryId" element={<ProtectedRoute><CreateClientInvoice /></ProtectedRoute>} />
                <Route path="/invoices/client/edit/:id" element={<ProtectedRoute><CreateClientInvoice /></ProtectedRoute>} />
                <Route path="/invoices/client/preview/:id" element={<ProtectedRoute><InvoicePDF /></ProtectedRoute>} />
                <Route path="/invoices/client/accumulated/:queryId" element={<ProtectedRoute><InvoicePDF isAccumulated={true} /></ProtectedRoute>} />
                <Route path="/invoices/client/:id/payment" element={<ProtectedRoute><AddClientPayment /></ProtectedRoute>} />

                {/* Supplier Invoices */}
                <Route path="/invoices/supplier" element={<ProtectedRoute><SupplierInvoiceList /></ProtectedRoute>} />
                <Route path="/invoices/supplier/query/:queryId" element={<ProtectedRoute><SupplierInvoiceList /></ProtectedRoute>} />
                <Route path="/invoices/supplier/create" element={<ProtectedRoute><CreateSupplierInvoice /></ProtectedRoute>} />
                <Route path="/invoices/supplier/create/:queryId" element={<ProtectedRoute><CreateSupplierInvoice /></ProtectedRoute>} />
                <Route path="/invoices/supplier/edit/:id" element={<ProtectedRoute><CreateSupplierInvoice /></ProtectedRoute>} />
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
                <Route path="/masters/users" element={<ProtectedRoute><UserMaster /></ProtectedRoute>} />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Suspense>
    )
}

export default AppRoutes
