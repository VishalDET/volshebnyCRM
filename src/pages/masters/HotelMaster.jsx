import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'

const HotelMaster = () => {
    const [hotels] = useState([])
    const columns = [
        { key: 'name', label: 'Hotel Name' },
        { key: 'destination', label: 'Destination' },
        { key: 'category', label: 'Category' },
        { key: 'rating', label: 'Rating' },
    ]

    return (
        <div>
            <PageHeader
                title="Hotel Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Hotels' }]}
                actions={<Button variant="primary">+ Add Hotel</Button>}
            />
            <div className="card">
                <Table columns={columns} data={hotels} emptyMessage="No hotels added" />
            </div>
        </div>
    )
}

export default HotelMaster
