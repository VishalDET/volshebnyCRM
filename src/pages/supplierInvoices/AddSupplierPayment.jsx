import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import { useForm } from '@hooks/useForm'

const AddSupplierPayment = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const initialValues = { amount: '', paymentMethod: '', date: '' }
    const handleSubmit = async (values) => { console.log(values); navigate('/invoices/supplier') }
    const { values, handleChange, handleSubmit: onSubmit } = useForm(initialValues, handleSubmit)

    return (
        <div>
            <PageHeader title="Add Supplier Payment" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Supplier Invoices', href: '/invoices/supplier' }, { label: 'Add Payment' }]} />
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
    )
}

export default AddSupplierPayment
