import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'

const DestinationMaster = () => {
    // Mock API Data
    const existingCountries = [
        { value: 'India', label: 'India' },
        { value: 'UAE', label: 'UAE' },
        { value: 'Thailand', label: 'Thailand' }
    ]

    const [destinations, setDestinations] = useState([
        { id: 1, country: 'India', city: 'Mumbai', places: ['Gateway of India', 'Marine Drive'] },
        { id: 2, country: 'UAE', city: 'Dubai', places: ['Burj Khalifa', 'Dubai Mall'] }
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ country: '', city: '', places: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const columns = [
        { key: 'country', label: 'Country' },
        { key: 'city', label: 'City' },
        { key: 'places', label: 'Places', render: (val) => val?.join(', ') || '-' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = (row) => {
        setFormData({
            country: row.country,
            city: row.city,
            places: row.places.join(', ')
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.country || !formData.city) return
        const placesArray = formData.places.split(',').map(p => p.trim()).filter(p => p)

        const newRecord = {
            country: formData.country,
            city: formData.city,
            places: placesArray
        }

        if (editingId) {
            setDestinations(destinations.map(d => d.id === editingId ? { ...newRecord, id: editingId } : d))
        } else {
            setDestinations([...destinations, { ...newRecord, id: Date.now() }])
        }

        closeModal()
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            setDestinations(destinations.filter(d => d.id !== deleteId))
            setDeleteId(null)
            setIsDeleteModalOpen(false)
        }
    }

    const closeModal = () => {
        setFormData({ country: '', city: '', places: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Destination Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Destinations' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Destination</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={destinations} emptyMessage="No destinations added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Destination" : "Add Destination"}>
                <div className="space-y-4">
                    <Select
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        options={existingCountries}
                        placeholder="Select Country"
                    />
                    <Input
                        label="City Name"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Enter city name"
                    />
                    <div>
                        <Input
                            label="Places (Optional, comma separated)"
                            value={formData.places}
                            onChange={(e) => setFormData({ ...formData, places: e.target.value })}
                            placeholder="E.g. Taj Mahal, Red Fort"
                        />
                        <p className="text-xs text-secondary-500 mt-1">Separate multiple places with commas</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Destination"
                message="Are you sure you want to delete this destination? This action cannot be undone."
            />
        </div>
    )
}

export default DestinationMaster
