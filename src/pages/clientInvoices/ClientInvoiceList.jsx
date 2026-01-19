import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { manageClientInvoice } from '@api/clientInvoice.api'
import { manageQuery } from '@api/query.api'
import { manageClient } from '@api/masters.api'
import { Eye, Pencil, Printer, MoreVertical, Plus, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Loader from '@components/Loader'
import InvoiceViewModal from '@components/InvoiceViewModal'

const ClientInvoiceList = () => {
    const { queryId } = useParams()
    const navigate = useNavigate()

    // State
    const [loading, setLoading] = useState(true)
    const [invoices, setInvoices] = useState([])
    const [query, setQuery] = useState(null)
    const [client, setClient] = useState(null)
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
            clientId: 0,
            invoiceNo: "string",
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
        const res = await manageClientInvoice(payload)
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
        if (qData) {
            setQuery(qData)
            if (qData.clientId) fetchClientData(qData.clientId)
        }
    }

    const fetchClientData = async (cId) => {
        try {
            const payload = {
                id: parseInt(cId),
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                gstCertificate: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const res = await manageClient(payload)
            const cData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (cData) setClient(cData)
        } catch (error) {
            console.error("Failed to load client details", error)
        }
    }

    const openViewModal = (invoice) => {
        setSelectedInvoice(invoice)
        setIsViewModalOpen(true)
    }

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const budget = query?.budget || 0
    const remaining = budget - totalInvoiced

    const columns = [
        {
            key: 'invoiceNo',
            label: 'Invoice No',
            render: (val, row) => (
                <div className="font-bold text-blue-900">{val || `INV-00${row.id}`}</div>
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
            key: 'invoiceDate',
            label: 'Date',
            render: (val) => val ? new Date(val).toLocaleDateString('en-GB') : '-'
        },
        {
            key: 'totalAmount',
            label: 'Invoice Value',
            render: (val) => <span className="font-semibold text-gray-900">${val.toLocaleString()}</span>
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
                    <Button variant="outline" className="p-1 px-2 text-xs" onClick={() => navigate(`/invoices/client/preview/${row.id}`)} title="Print Preview">
                        <Printer size={14} />
                    </Button>
                    <Button variant="outline" className="p-1 px-2 text-xs" onClick={() => navigate(`/invoices/client/edit/${row.id}`)} title="Edit">
                        <Pencil size={14} />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="p-6">
            <PageHeader
                title={queryId ? `Invoices for Query #${queryId}` : "Client Invoices"}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: 'Invoices' }
                ]}
                actions={
                    <div className="flex gap-2">
                        {queryId && (
                            <Button variant="primary" onClick={() => navigate(`/invoices/client/accumulated/${queryId}`)} icon={<Printer size={16} />}>
                                Print Accumulated
                            </Button>
                        )}
                        <Button variant="primary" onClick={() => navigate(queryId ? `/invoices/client/create/${queryId}` : '/invoices/client/create')} icon={<Plus size={16} />}>
                            New Invoice
                        </Button>
                    </div>
                }
            />

            {/* Budget Summary Bar (Query Context Only) */}
            {queryId && query && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="card bg-gray-50 border-gray-200 p-4">
                        <div className="text-xs font-bold text-gray-500 uppercase">Query Budget</div>
                        <div className="text-xl font-black text-gray-900">${budget.toLocaleString()}</div>
                    </div>
                    <div className="card bg-gray-50 border-gray-200 p-4">
                        <div className="text-xs font-bold text-gray-500 uppercase">Total Invoiced</div>
                        <div className="text-xl font-black text-red-600">${totalInvoiced.toLocaleString()}</div>
                    </div>
                    <div className="card bg-blue-50 border-blue-200 p-4">
                        <div className="text-xs font-bold text-blue-600 uppercase">Remaining</div>
                        <div className="text-xl font-black text-blue-900">${remaining.toLocaleString()}</div>
                    </div>
                    <div className="card bg-green-50 border-green-200 p-4">
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

            <InvoiceViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                invoice={selectedInvoice}
                query={query}
                client={client}
            />
        </div>
    )
}

export default ClientInvoiceList
