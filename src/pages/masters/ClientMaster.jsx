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

const ClientMaster = () => {
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

    const [clients, setClients] = useState([
        {
            id: 1,
            companyName: 'ABC Travels',
            country: 'India',
            city: 'Mumbai',
            address: '123, Main Street',
            gst: '27AAAAA1234A1Z5',
            primaryContact: 'John Doe',
            contacts: [{ name: 'John Doe', number: '9876543210', email: 'john@abc.com' }]
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        companyName: '',
        country: '',
        city: '',
        address: '',
        gst: '',
        contacts: [{ name: '', number: '', email: '' }] // Initial empty contact
    })
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    // Derived state for cities based on selected country
    const availableCities = useMemo(() => {
        return formData.country ? citiesDB[formData.country] || [] : []
    }, [formData.country])

    const columns = [
        { key: 'companyName', label: 'Company Name' },
        { key: 'country', label: 'Country' },
        { key: 'city', label: 'City' },
        {
            key: 'primaryContact',
            label: 'Primary Contact',
            render: (_, row) => row.contacts[0]?.name || '-'
        },
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

    const handleAddContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { name: '', number: '', email: '' }]
        })
    }

    const handleRemoveContact = (index) => {
        if (formData.contacts.length === 1) return // Prevent deleting the last contact
        const newContacts = formData.contacts.filter((_, i) => i !== index)
        setFormData({ ...formData, contacts: newContacts })
    }

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts]
        newContacts[index][field] = value
        setFormData({ ...formData, contacts: newContacts })
    }

    const handleEdit = (row) => {
        setFormData({
            companyName: row.companyName,
            country: row.country,
            city: row.city,
            address: row.address,
            gst: row.gst,
            contacts: row.contacts.length > 0 ? row.contacts : [{ name: '', number: '', email: '' }]
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.companyName || !formData.country || !formData.city) return

        if (editingId) {
            setClients(clients.map(c => c.id === editingId ? { ...c, ...formData } : c))
        } else {
            setClients([...clients, { id: Date.now(), ...formData }])
        }

        closeModal()
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            setClients(clients.filter(c => c.id !== deleteId))
            setDeleteId(null)
            setIsDeleteModalOpen(false)
        }
    }

    const closeModal = () => {
        setFormData({
            companyName: '', country: '', city: '', address: '', gst: '',
            contacts: [{ name: '', number: '', email: '' }]
        })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Client Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Clients' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Client</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={clients} emptyMessage="No clients added" />
            </div>

            {/* Modal with Scrollable Content */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Client" : "Add Client"} size="lg">
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    {/* Basic Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-secondary-900 border-b pb-2">Company Details</h3>
                        <Input
                            label="Company Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="Enter company name"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value, city: '' })}
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

                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Full address"
                        />
                        <Input
                            label="GST Number (Optional)"
                            value={formData.gst}
                            onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                            placeholder="GSTIN"
                        />
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-bold text-secondary-900">Contact Details</h3>
                            <button
                                type="button"
                                onClick={handleAddContact}
                                className="text-xs text-primary-600 font-semibold hover:text-primary-800"
                            >
                                + Add Another Contact
                            </button>
                        </div>

                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="p-4 bg-secondary-50 rounded-lg relative group">
                                {formData.contacts.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveContact(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        title="Remove Contact"
                                    >
                                        &times;
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Name"
                                        value={contact.name}
                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                        placeholder="Contact Person"
                                    />
                                    <Input
                                        label="Number"
                                        value={contact.number}
                                        onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                                        placeholder="Phone Number"
                                    />
                                    <Input
                                        label="Email"
                                        value={contact.email}
                                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-secondary-200">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'} Client</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Client"
                message="Are you sure you want to delete this client? This action cannot be undone."
            />
        </div>
    )
}

export default ClientMaster
