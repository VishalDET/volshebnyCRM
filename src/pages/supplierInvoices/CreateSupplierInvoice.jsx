import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import { useForm } from '@hooks/useForm'

const CreateSupplierInvoice = () => {
    const navigate = useNavigate()
    const initialValues = { supplierName: '', amount: '', date: '' }
    const handleSubmit = async (values) => { console.log(values); navigate('/invoices/supplier') }
    const { values, handleChange, handleSubmit: onSubmit } = useForm(initialValues, handleSubmit)

    return (
        <div>
            <PageHeader title="Create Supplier Invoice" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Supplier Invoices', href: '/invoices/supplier' }, { label: 'Create' }]} />
            <form onSubmit={onSubmit} className="card max-w-2xl">
                <div className="space-y-4">
                    <Input label="Supplier Name" name="supplierName" value={values.supplierName} onChange={handleChange} required />
                    <Input label="Amount" name="amount" type="number" value={values.amount} onChange={handleChange} required />
                    <Input label="Date" name="date" type="date" value={values.date} onChange={handleChange} />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => navigate('/invoices/supplier')}>Cancel</Button>
                        <Button type="submit" variant="primary">Create Invoice</Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateSupplierInvoice
