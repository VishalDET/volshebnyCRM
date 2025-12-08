import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'

const RateMaster = () => {
    const [rates] = useState([])
    const columns = [
        { key: 'service', label: 'Service' },
        { key: 'destination', label: 'Destination' },
        { key: 'season', label: 'Season' },
        { key: 'rate', label: 'Rate', render: (val) => `₹${val?.toLocaleString()}` },
    ]

    return (
        <div>
            <PageHeader
                title="Rate Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Rates' }]}
                actions={<Button variant="primary">+ Add Rate</Button>}
            />
            <div className="card">
                <Table columns={columns} data={rates} emptyMessage="No rates added" />
            </div>
        </div>
    )
}

export default RateMaster
