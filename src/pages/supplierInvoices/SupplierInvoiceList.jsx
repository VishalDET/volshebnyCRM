import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { manageSupplierInvoice } from '@api/supplierInvoice.api'
import { manageQuery } from '@api/query.api'
import { manageSupplier } from '@api/masters.api'
import { Eye, Pencil, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Loader from '@components/Loader'
import SupplierInvoiceViewModal from '@components/SupplierInvoiceViewModal'

const SupplierInvoiceList = () => {
    const { queryId } = useParams()
    const navigate = useNavigate()

    // State
    const [loading, setLoading] = useState(true)
    const [invoices, setInvoices] = useState([])
    const [query, setQuery] = useState(null)
    const [suppliers, setSuppliers] = useState([])
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)

    useEffect(() => {
        fetchAllData()
    }, [queryId])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchInvoices(),
                fetchSuppliers(),
                queryId ? fetchQueryData() : Promise.resolve()
            ])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load invoice data")
        } finally {
            setLoading(false)
        }
    }

    const fetchInvoices = async () => {
        const payload = {
            id: 0,
            queryId: queryId ? parseInt(queryId) : 0,
            supplierId: 0,
            serviceType: "string",
            supplierInvNo: "string",
            invoiceDate: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            currencyId: 0,
            isDomestic: true,
            totalAmount: 0,
            gst: 0,
            serviceCharge: 0,
            remittance: 0,
            rateOfExchange: 0,
            paymentMethod: "string",
            comments: "string",
            netAmount: 0,
            paymentStatus: "string",
            userId: 0,
            spType: "R"
        }
        const res = await manageSupplierInvoice(payload)
        const data = res.data?.data || []
        setInvoices(data)
    }

    const fetchQueryData = async () => {
        const payload = {
            id: parseInt(queryId),
            queryNo: "",
            handlerId: 0,
            clientId: 0,
            originCountryId: 0,
            originCityId: 0,
            travelDate: null,
            returnDate: null,
            totalDays: 0,
            adults: 0,
            children: 0,
            infants: 0,
            budget: 0,
            queryStatus: "",
            specialRequirements: "",
            createdBy: 0,
            modifiedBy: 0,
            isActive: true,
            spType: "E",
            destinations: [],
            childAges: []
        }
        const res = await manageQuery(payload)
        const qData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
        if (qData) setQuery(qData)
    }

    const fetchSuppliers = async () => {
        try {
            const payload = {
                id: 0,
                supplierName: "",
                supplierType: "",
                spType: "R"
            }
            const res = await manageSupplier(payload)
            setSuppliers(res.data?.data || [])
        } catch (error) {
            console.error("Failed to fetch suppliers", error)
        }
    }

    const getSupplierName = (sId) => {
        const supplier = suppliers.find(s => s.id === sId)
        return supplier ? supplier.supplierName : `Supplier #${sId}`
    }

    const openViewModal = (invoice) => {
        setSelectedInvoice(invoice)
        setIsViewModalOpen(true)
    }

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    // For supplier invoices, we might want to compare with a different budget or just show total cost
    const budget = query?.budget || 0

    const columns = [
        {
            key: 'supplierInvNo',
            label: 'Inv No',
            render: (val, row) => (
                <div className="font-bold text-blue-900">{val || `SUP-00${row.id}`}</div>
            )
        },
        {
            key: 'queryNo',
            label: 'Query No',
            render: (val, row) => (
                <div className="text-sm font-medium text-secondary-600">{val || row.queryId || '-'}</div>
            )
        },
        {
            key: 'supplierId',
            label: 'Supplier',
            render: (val) => getSupplierName(val)
        },
        {
            key: 'serviceType',
            label: 'Service',
            render: (val) => <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{val}</span>
        },
        {
            key: 'invoiceDate',
            label: 'Date',
            render: (val) => val ? new Date(val).toLocaleDateString('en-GB') : '-'
        },
        {
            key: 'netAmount',
            label: 'Amount',
            render: (val) => <span className="font-semibold text-gray-900">₹{val.toLocaleString()}</span>
        },
        {
            key: 'paymentStatus',
            label: 'Status',
            render: (val) => (
                <span className={`badge ${val?.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {val || 'Unpaid'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button variant="outline" className="p-1 px-2 text-xs" onClick={() => openViewModal(row)} title="Quick View">
                        <Eye size={14} /> View
                    </Button>
                    <Button variant="outline" className="p-1 px-2 text-xs" onClick={() => navigate(`/invoices/supplier/edit/${row.id}`)} title="Edit">
                        <Pencil size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="p-6">
            <PageHeader
                title={queryId ? `Supplier Invoices for Query #${queryId}` : "Supplier Invoices"}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: 'Supplier Invoices' }
                ]}
                actions={
                    <Button
                        variant="primary"
                        onClick={() => navigate(queryId ? `/invoices/supplier/create/${queryId}` : '/invoices/supplier/create')}
                        icon={<Plus size={16} />}
                    >
                        New Supplier Invoice
                    </Button>
                }
            />

            {queryId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="card bg-gray-50 border-gray-200 p-4 font-inter">
                        <div className="text-xs font-bold text-gray-500 uppercase">Query Budget</div>
                        <div className="text-xl font-black text-gray-900">₹{budget.toLocaleString()}</div>
                    </div>
                    <div className="card bg-gray-50 border-gray-200 p-4 font-inter">
                        <div className="text-xs font-bold text-gray-500 uppercase">Total Supplier Cost</div>
                        <div className="text-xl font-black text-red-600">₹{totalInvoiced.toLocaleString()}</div>
                    </div>
                    <div className="card bg-green-50 border-green-200 p-4 font-inter">
                        <div className="text-xs font-bold text-green-600 uppercase">Invoices Count</div>
                        <div className="text-xl font-black text-green-900">{invoices.length}</div>
                    </div>
                </div>
            )}

            <div className="card mt-6 p-0 overflow-hidden">
                {loading ? <Loader text="Loading Invoices..." /> : (
                    <Table columns={columns} data={invoices} />
                )}
            </div>

            <SupplierInvoiceViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                invoice={selectedInvoice}
                query={query}
                supplierName={selectedInvoice ? getSupplierName(selectedInvoice.supplierId) : ''}
            />
        </div>
    )
}

export default SupplierInvoiceList
