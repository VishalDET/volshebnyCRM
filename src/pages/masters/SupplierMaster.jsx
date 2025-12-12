import { useState, useMemo } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'

const SupplierMaster = () => {
    // Mock Data simulating other masters
    const countries = [
        { value: 'India', label: 'India' },
        { value: 'UAE', label: 'UAE' },
        { value: 'Thailand', label: 'Thailand' }
    ]

    // City data linked to countries
    const citiesDB = {
        'India': [{ value: 'Mumbai', label: 'Mumbai' }, { value: 'Delhi', label: 'Delhi' }],
        'UAE': [{ value: 'Dubai', label: 'Dubai' }, { value: 'Abu Dhabi', label: 'Abu Dhabi' }],
        'Thailand': [{ value: 'Bangkok', label: 'Bangkok' }, { value: 'Phuket', label: 'Phuket' }]
    }

    const serviceTypes = [
        { value: 'Hotel', label: 'Hotel' },
        { value: 'Bus', label: 'Bus' },
        { value: 'Restaurant', label: 'Restaurant' },
        { value: 'Activity', label: 'Activity' }
    ]

    const [suppliers, setSuppliers] = useState([
        { id: 1, name: 'Taj Hotels', country: 'India', city: 'Mumbai', services: ['Hotel', 'Restaurant'] },
        { id: 2, name: 'Dubai Transport', country: 'UAE', city: 'Dubai', services: ['Bus'] }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        city: '',
        services: [] // Array for multi-select
    })
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    // Derived state for cities based on selected country
    const availableCities = useMemo(() => {
        return formData.country ? citiesDB[formData.country] || [] : []
    }, [formData.country])

    const columns = [
        { key: 'name', label: 'Company Name' },
        { key: 'country', label: 'Country' },
        { key: 'city', label: 'City' },
        { key: 'services', label: 'Services', render: (val) => val?.join(', ') || '-' },
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

    const handleServiceChange = (e) => {
        const value = e.target.value
        // Simple toggle logic for multi-select simulation with a standard select box
        // In a real app, use a proper MultiSelect component
        // Here we just add if not present, but for simplicity let's assume it's valid
        // Actually, for better UX with standard select, let's just use it as single select or simple checkboxes
        // User requested multi-select, let's implement checkboxes for services
    }

    const toggleService = (service) => {
        if (formData.services.includes(service)) {
            setFormData({ ...formData, services: formData.services.filter(s => s !== service) })
        } else {
            setFormData({ ...formData, services: [...formData.services, service] })
        }
    }

    const handleEdit = (row) => {
        setFormData({
            name: row.name,
            country: row.country,
            city: row.city,
            services: row.services || []
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.name || !formData.country || !formData.city) return

        if (editingId) {
            setSuppliers(suppliers.map(s => s.id === editingId ? { ...s, ...formData } : s))
        } else {
            setSuppliers([...suppliers, { id: Date.now(), ...formData }])
        }

        closeModal()
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            setSuppliers(suppliers.filter(s => s.id !== deleteId))
            setDeleteId(null)
            setIsDeleteModalOpen(false)
        }
    }

    const closeModal = () => {
        setFormData({ name: '', country: '', city: '', services: [] })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Supplier Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Suppliers' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Supplier</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={suppliers} emptyMessage="No suppliers added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Supplier" : "Add Supplier"}>
                <div className="space-y-4">
                    <Input
                        label="Company Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter company name"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Country"
                            name="country"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value, city: '' })} // Reset city on country change
                            options={countries}
                            placeholder="Select Country"
                        />
                        <Select
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            options={availableCities}
                            placeholder={formData.country ? "Select City" : "Select Country First"}
                            disabled={!formData.country}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Services Provided</label>
                        <div className="grid grid-cols-2 gap-2 border border-secondary-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {serviceTypes.map(service => (
                                <label key={service.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.services.includes(service.value)}
                                        onChange={() => toggleService(service.value)}
                                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-secondary-700">{service.label}</span>
                                </label>
                            ))}
                        </div>
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
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier?"
            />
        </div>
    )
}

export default SupplierMaster
