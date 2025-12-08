import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'

const SightseeingMaster = () => {
    const [sightseeing] = useState([])
    const columns = [
        { key: 'name', label: 'Sightseeing' },
        { key: 'destination', label: 'Destination' },
        { key: 'duration', label: 'Duration' },
        { key: 'price', label: 'Price' },
    ]

    return (
        <div>
            <PageHeader
                title="Sightseeing Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Sightseeing' }]}
                actions={<Button variant="primary">+ Add Sightseeing</Button>}
            />
            <div className="card">
                <Table columns={columns} data={sightseeing} emptyMessage="No sightseeing options added" />
            </div>
        </div>
    )
}

export default SightseeingMaster
