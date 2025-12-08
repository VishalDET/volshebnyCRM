import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchSupplierInvoices } from '@redux/invoiceSlice'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'

const SupplierInvoiceList = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { supplierInvoices, loading } = useSelector((state) => state.invoice)

    useEffect(() => {
        dispatch(fetchSupplierInvoices())
    }, [dispatch])

    const columns = [
        { key: 'invoiceNo', label: 'Invoice No' },
        { key: 'supplierName', label: 'Supplier' },
        { key: 'amount', label: 'Amount', render: (val) => `₹${val?.toLocaleString()}` },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (val) => <span className={`badge ${val === 'paid' ? 'badge-success' : 'badge-warning'}`}>{val}</span> },
    ]

    return (
        <div>
            <PageHeader
                title="Supplier Invoices"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Supplier Invoices' }]}
                actions={<Button variant="primary" onClick={() => navigate('/invoices/supplier/create')}>+ Create Invoice</Button>}
            />
            <div className="card">
                <Table columns={columns} data={supplierInvoices} loading={loading} />
            </div>
        </div>
    )
}

export default SupplierInvoiceList
