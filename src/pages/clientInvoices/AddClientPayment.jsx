import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import { useForm } from '@hooks/useForm'

const AddClientPayment = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const initialValues = { amount: '', paymentMethod: '', date: '', reference: '' }
    const handleSubmit = async (values) => { console.log(values); navigate('/invoices/client') }
    const { values, handleChange, handleSubmit: onSubmit } = useForm(initialValues, handleSubmit)

    return (
        <div>
            <PageHeader title="Add Payment" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Client Invoices', href: '/invoices/client' }, { label: 'Add Payment' }]} />
            <form onSubmit={onSubmit} className="card max-w-2xl">
                <div className="space-y-4">
                    <Input label="Amount" name="amount" type="number" value={values.amount} onChange={handleChange} required />
                    <Input label="Payment Method" name="paymentMethod" value={values.paymentMethod} onChange={handleChange} />
                    <Input label="Date" name="date" type="date" value={values.date} onChange={handleChange} />
                    <Input label="Reference" name="reference" value={values.reference} onChange={handleChange} />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => navigate('/invoices/client')}>Cancel</Button>
                        <Button type="submit" variant="primary">Add Payment</Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AddClientPayment
