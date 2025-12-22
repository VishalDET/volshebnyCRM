import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import MastersNavigation from '@components/MastersNavigation'
import { Pencil, Trash2 } from 'lucide-react'
import ConfirmModal from '@components/ConfirmModal'
import { manageCountry } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const CountryMaster = () => {
    const [countries, setCountries] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchCountries()
    }, [])

    const fetchCountries = async () => {
        setIsLoading(true)
        try {
            const payload = {
                countryId: 0,
                countryName: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageCountry(payload)
            console.log('API Response:', response.data) // Debug log

            // Check if response has data - adjust based on actual API structure
            if (response.data) {
                // If data is directly an array
                if (Array.isArray(response.data)) {
                    setCountries(response.data)
                }
                // If data has a nested data property
                else if (response.data.data && Array.isArray(response.data.data)) {
                    setCountries(response.data.data)
                }
                // If data has isValid flag
                else if (response.data.isValid && response.data.data) {
                    setCountries(response.data.data)
                }
                else {
                    console.log('Unexpected response structure:', response.data)
                    toast.error('Unexpected response format')
                }
            } else {
                toast.error('Failed to fetch countries')
            }
        } catch (error) {
            console.error('Error fetching countries:', error)
            toast.error('Error loading countries')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'countryName', label: 'Country Name' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.countryId)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = (row) => {
        setFormData({ name: row.countryName })
        setEditingId(row.countryId)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name) return

        try {
            const payload = {
                countryId: editingId || 0,
                countryName: formData.name,
                isActive: true,
                isDeleted: false,
                spType: editingId ? "U" : "C"
            }

            const response = await manageCountry(payload)
            console.log('Save Response:', response.data) // Debug log

            // Check for success - handle multiple response structures
            const isSuccess = response.data && (
                response.data.isValid === true ||
                response.data.success === true ||
                response.status === 200
            )

            if (isSuccess) {
                toast.success(editingId ? 'Country updated successfully' : 'Country added successfully')
                fetchCountries()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save country')
            }
        } catch (error) {
            console.error('Error saving country:', error)
            toast.error('Error saving country')
        }
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (deleteId) {
            try {
                const payload = {
                    countryId: deleteId,
                    countryName: "",
                    isActive: true,
                    isDeleted: true,
                    spType: "D"
                }

                const response = await manageCountry(payload)
                console.log('Delete Response:', response.data) // Debug log

                // Check for success - handle multiple response structures
                const isSuccess = response.data && (
                    response.data.isValid === true ||
                    response.data.success === true ||
                    response.status === 200
                )

                if (isSuccess) {
                    toast.success('Country deleted successfully')
                    fetchCountries()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete country')
                }
            } catch (error) {
                console.error('Error deleting country:', error)
                toast.error('Error deleting country')
            }
        }
    }

    const closeModal = () => {
        setFormData({ name: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Country Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Countries' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Country</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={countries} emptyMessage="No countries added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Country" : "Add Country"}>
                <div className="space-y-4">
                    <Input
                        label="Country Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter country name"
                    />
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
                title="Delete Country"
                message="Are you sure you want to delete this country? This action cannot be undone."
            />
        </div>
    )
}

export default CountryMaster
