import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'

const DestinationMaster = () => {
    const [destinations, setDestinations] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', country: '', description: '' })

    const columns = [
        { key: 'name', label: 'Destination' },
        { key: 'country', label: 'Country' },
        { key: 'description', label: 'Description' },
    ]

    const handleAdd = () => {
        setDestinations([...destinations, { ...formData, id: Date.now() }])
        setFormData({ name: '', country: '', description: '' })
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Destination Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Destinations' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Destination</Button>}
            />
            <div className="card">
                <Table columns={columns} data={destinations} emptyMessage="No destinations added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Destination">
                <div className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <Input label="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAdd}>Add</Button>
                </div>
            </Modal>
        </div>
    )
}

export default DestinationMaster
