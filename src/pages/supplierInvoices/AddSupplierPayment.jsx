import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import { useForm } from '@hooks/useForm'
import { getSupplierInvoiceById, manageSupplierInvoice } from '@api/supplierInvoice.api'
import { manageQuery } from '@api/query.api'
import { toast } from 'react-hot-toast'

const AddSupplierPayment = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const initialValues = { amount: '', paymentMethod: '', date: new Date().toISOString().split('T')[0] }
    const handleSubmit = async (values) => { console.log(values); navigate('/invoices/supplier') }
    const { values, handleChange, handleSubmit: onSubmit, setValues } = useForm(initialValues, handleSubmit)

    const [loading, setLoading] = useState(false)
    const [invoice, setInvoice] = useState(null)
    const [query, setQuery] = useState(null)
    const [existingInvoices, setExistingInvoices] = useState([])

    useEffect(() => {
        if (id) fetchInvoice()
    }, [id])

    const fetchInvoice = async () => {
        setLoading(true)
        try {
            const res = await getSupplierInvoiceById(id)
            const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (data) {
                setInvoice(data)
                // Pre-fill form values
                setValues(prev => ({ ...prev, amount: data.netAmount || data.totalAmount || '', paymentMethod: data.paymentMethod || '', date: data.invoiceDate ? data.invoiceDate.split('T')[0] : prev.date }))

                const qId = data.queryId || data.queryID || 0
                if (qId) await fetchQueryAndInvoices(qId)
            }
        } catch (error) {
            console.error('Failed to load invoice', error)
            toast.error('Failed to load invoice')
        } finally {
            setLoading(false)
        }
    }

    const fetchQueryAndInvoices = async (qId) => {
        try {
            const qPayload = { id: parseInt(qId), spType: 'E' }
            const qRes = await manageQuery(qPayload)
            const qData = Array.isArray(qRes.data?.data) ? qRes.data.data[0] : qRes.data?.data
            if (qData) setQuery(qData)

            const invPayload = { id: 0, queryId: parseInt(qId), spType: 'R' }
            const invRes = await manageSupplierInvoice(invPayload)
            const invs = invRes.data?.data || []
            // Exclude current invoice from existing list
            const filtered = invs.filter(inv => String(inv.id) !== String(id))
            setExistingInvoices(filtered)
        } catch (error) {
            console.error('Failed to fetch query or invoices', error)
        }
    }

    const totalInvoiced = existingInvoices.reduce((s, inv) => s + (parseFloat(inv.totalAmount) || 0), 0)
    const budget = query?.totalBudget || query?.budget || 0
    const remaining = budget - totalInvoiced

    return (
        <div>
            <PageHeader title="Add Supplier Payment" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Supplier Invoices', href: '/invoices/supplier' }, { label: 'Add Payment' }]} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={onSubmit} className="card max-w-2xl">
                        <div className="space-y-4">
                            <Input label="Amount" name="amount" type="number" value={values.amount} onChange={handleChange} required />
                            <Input label="Payment Method" name="paymentMethod" value={values.paymentMethod} onChange={handleChange} />
                            <Input label="Date" name="date" type="date" value={values.date} onChange={handleChange} />
                            <div className="flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => navigate('/invoices/supplier')}>Cancel</Button>
                                <Button type="submit" variant="primary">Add Payment</Button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="card p-4">
                        <h4 className="font-bold mb-3">Cost Summary</h4>
                        <div className="text-sm">
                            <div className="mb-2"><strong>Query:</strong> {query?.queryNo || '—'}</div>
                            <div className="mb-2"><strong>Query Budget:</strong> ${budget.toLocaleString()}</div>
                            <div className="mb-2"><strong>Total Invoiced:</strong> ${totalInvoiced.toLocaleString()}</div>
                            <div className="mb-2"><strong>Remaining:</strong> ${remaining.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddSupplierPayment
