import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'

const ConfirmQuery = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const handleConfirm = () => {
        // Confirmation logic here
        navigate(`/queries/${id}`)
    }

    return (
        <div>
            <PageHeader
                title="Confirm Query"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: `Query #${id}`, href: `/queries/${id}` },
                    { label: 'Confirm' }
                ]}
            />
            <div className="card max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Confirm Query Details</h3>
                <p className="text-secondary-600 mb-6">Review and confirm the query before proceeding.</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => navigate(`/queries/${id}`)}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirm}>Confirm Query</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmQuery
