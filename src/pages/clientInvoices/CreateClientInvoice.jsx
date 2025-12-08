import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import { useForm } from '@hooks/useForm'

const CreateClientInvoice = () => {
    const navigate = useNavigate()
    const initialValues = { clientName: '', queryId: '', amount: '', items: '' }
    const handleSubmit = async (values) => { console.log(values); navigate('/invoices/client') }
    const { values, handleChange, handleSubmit: onSubmit } = useForm(initialValues, handleSubmit)

    return (
        <div>
            <PageHeader title="Create Client Invoice" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Client Invoices', href: '/invoices/client' }, { label: 'Create' }]} />
            <form onSubmit={onSubmit} className="card max-w-2xl">
                <div className="space-y-4">
                    <Input label="Client Name" name="clientName" value={values.clientName} onChange={handleChange} required />
                    <Input label="Query ID" name="queryId" value={values.queryId} onChange={handleChange} />
                    <Input label="Amount" name="amount" type="number" value={values.amount} onChange={handleChange} required />
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={() => navigate('/invoices/client')}>Cancel</Button>
                        <Button type="submit" variant="primary">Create Invoice</Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateClientInvoice
