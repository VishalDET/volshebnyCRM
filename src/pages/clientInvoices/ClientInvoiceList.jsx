import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchClientInvoices } from '@redux/invoiceSlice'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'

const ClientInvoiceList = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { clientInvoices, loading } = useSelector((state) => state.invoice)

    useEffect(() => {
        dispatch(fetchClientInvoices())
    }, [dispatch])

    const columns = [
        { key: 'invoiceNo', label: 'Invoice No' },
        { key: 'clientName', label: 'Client' },
        { key: 'amount', label: 'Amount', render: (val) => `₹${val?.toLocaleString()}` },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (val) => <span className={`badge ${val === 'paid' ? 'badge-success' : 'badge-warning'}`}>{val}</span> },
        {
            key: 'actions', label: 'Actions', render: (_, row) => (
                <button onClick={() => navigate(`/invoices/client/${row.id}/payment`)} className="text-primary-600">Add Payment</button>
            )
        },
    ]

    return (
        <div>
            <PageHeader
                title="Client Invoices"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Client Invoices' }]}
                actions={<Button variant="primary" onClick={() => navigate('/invoices/client/create')}>+ Create Invoice</Button>}
            />
            <div className="card">
                <Table columns={columns} data={clientInvoices} loading={loading} />
            </div>
        </div>
    )
}

export default ClientInvoiceList
