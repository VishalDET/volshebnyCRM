import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'

const PaxDetails = () => {
    const { id } = useParams()
    const [passengers, setPassengers] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', age: '', gender: '', passportNo: '' })

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
        { key: 'gender', label: 'Gender' },
        { key: 'passportNo', label: 'Passport No' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row, index) => (
                <button onClick={() => handleDelete(index)} className="text-red-600">Delete</button>
            )
        },
    ]

    const handleAdd = () => {
        setPassengers([...passengers, formData])
        setFormData({ name: '', age: '', gender: '', passportNo: '' })
        setIsModalOpen(false)
    }

    const handleDelete = (index) => {
        setPassengers(passengers.filter((_, i) => i !== index))
    }

    return (
        <div>
            <PageHeader
                title="Passenger Details"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: `Query #${id}`, href: `/queries/${id}` },
                    { label: 'Passengers' }
                ]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Passenger</Button>}
            />

            <div className="card">
                <Table columns={columns} data={passengers} emptyMessage="No passengers added yet" />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Passenger">
                <div className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <Input label="Age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                    <Input label="Gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
                    <Input label="Passport No" value={formData.passportNo} onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })} />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAdd}>Add</Button>
                </div>
            </Modal>
        </div>
    )
}

export default PaxDetails
