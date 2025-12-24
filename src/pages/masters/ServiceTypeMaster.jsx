import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageServiceType } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const ServiceTypeMaster = () => {
    const [services, setServices] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ type: '', description: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        setIsLoading(true)
        try {
            const payload = {
                serviceId: 0,
                serviceName: "string",
                description: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageServiceType(payload)
            console.log('Services Response:', response.data)

            if (response.data) {
                if (Array.isArray(response.data)) {
                    setServices(response.data)
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setServices(response.data.data)
                } else if (response.data.success && response.data.data) {
                    setServices(response.data.data)
                } else {
                    console.log('Unexpected response structure:', response.data)
                    toast.error('Unexpected response format')
                }
            } else {
                toast.error('Failed to fetch services')
            }
        } catch (error) {
            console.error('Error fetching services:', error)
            toast.error('Error loading services')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'serviceName', label: 'Service Type' },
        { key: 'description', label: 'Description' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.serviceId)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = (row) => {
        setFormData({ type: row.serviceName, description: row.description || '' })
        setEditingId(row.serviceId)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.type) {
            toast.error('Please enter service type')
            return
        }

        try {
            const payload = {
                serviceId: editingId || 0,
                serviceName: formData.type,
                description: formData.description || '',
                isActive: true,
                isDeleted: false,
                spType: editingId ? "U" : "C"
            }

            const response = await manageServiceType(payload)
            console.log('Save Response:', response.data)

            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200 ||
                response.data.isValid === true
            )

            if (isSuccess) {
                toast.success(editingId ? 'Service updated successfully' : 'Service added successfully')
                fetchServices()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save service')
            }
        } catch (error) {
            console.error('Error saving service:', error)
            toast.error('Error saving service')
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
                    serviceId: deleteId,
                    serviceName: "",
                    description: "",
                    isActive: true,
                    isDeleted: true,
                    spType: "D"
                }

                const response = await manageServiceType(payload)
                console.log('Delete Response:', response.data)

                const isSuccess = response.data && (
                    response.data.success === true ||
                    response.status === 200 ||
                    response.data.isValid === true
                )

                if (isSuccess) {
                    toast.success('Service deleted successfully')
                    fetchServices()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete service')
                }
            } catch (error) {
                console.error('Error deleting service:', error)
                toast.error('Error deleting service')
            }
        }
    }

    const closeModal = () => {
        setFormData({ type: '', description: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Service Type Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Service Types' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Service Type</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={services} emptyMessage="No service types added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Service Type" : "Add Service Type"}>
                <div className="space-y-4">
                    <Input
                        label="Service Type *"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="E.g. Hotel, Bus, Restaurant"
                    />
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter description"
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
                title="Delete Service Type"
                message="Are you sure you want to delete this service type?"
            />
        </div>
    )
}

export default ServiceTypeMaster
