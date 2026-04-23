import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { Pencil, Trash2, Eye } from 'lucide-react'
import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageOffice } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'
import OfficeFormModal from './OfficeFormModal'
import OfficeViewModal from './OfficeViewModal'

const OfficeList = () => {
    const { user } = useAuth()
    const [offices, setOffices] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [editingData, setEditingData] = useState(null)
    const [viewData, setViewData] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchOffices()
    }, [])

    const fetchOffices = async () => {
        setIsLoading(true)
        try {
            const payload = {
                "officeId": 0,
                "officeName": "string",
                "currencyId": 0,
                "countryId": 0,
                "cityId": 0,
                "address": "string",
                "createdBy": 0,
                "modifiedBy": 0,
                "isActive": true,
                "spType": "R",
                "contacts": [
                    {
                        "contactId": 0,
                        "officeId": 0,
                        "contactName": "string",
                        "contactNumber": "string",
                        "contactEmail": "string",
                        "spType": "string"
                    }
                ]
            }
            const response = await manageOffice(payload)
            if (response.data?.data) {
                setOffices(response.data.data)
            } else if (Array.isArray(response.data)) {
                setOffices(response.data)
            }
        } catch (error) {
            console.error('Error fetching offices:', error)
            toast.error('Failed to fetch offices')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'officeName', label: 'Office Name' },
        { key: 'address', label: 'Address' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleView(row)}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.officeId)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = async (row) => {
        try {
            const payload = {
                officeId: row.officeId,
                officeName: 'string',
                currencyId: 0,
                countryId: 0,
                cityId: 0,
                address: 'string',
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: 'E',
                contacts: [
                    {
                        contactId: 0,
                        officeId: 0,
                        contactName: 'string',
                        contactNumber: 'string',
                        contactEmail: 'string',
                        spType: 'string'
                    }
                ]
            }
            const response = await manageOffice(payload)
            const detail = response.data?.data?.[0] ?? row
            setEditingData(detail)
            setIsModalOpen(true)
        } catch (error) {
            console.error('Error fetching office detail:', error)
            setEditingData(row)
            setIsModalOpen(true)
        }
    }

    const handleView = async (row) => {
        try {
            const payload = {
                officeId: row.officeId,
                officeName: 'string',
                currencyId: 0,
                countryId: 0,
                cityId: 0,
                address: 'string',
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: 'E',
                contacts: [
                    {
                        contactId: 0,
                        officeId: 0,
                        contactName: 'string',
                        contactNumber: 'string',
                        contactEmail: 'string',
                        spType: 'string'
                    }
                ]
            }
            const response = await manageOffice(payload)
            const detail = response.data?.data?.[0] ?? row
            setViewData(detail)
            setIsViewModalOpen(true)
        } catch (error) {
            console.error('Error fetching office detail for view:', error)
            setViewData(row)
            setIsViewModalOpen(true)
        }
    }

    const handleDeleteClick = (officeId) => {
        setDeleteId(officeId)
        setIsDeleteModalOpen(true)
    }

    const handleSave = async (formData) => {
        try {
            const isEdit = !!editingData?.officeId
            const payload = {
                officeId: editingData?.officeId || 0,
                officeName: formData.officeName,
                address: formData.address,
                countryId: parseInt(formData.countryId) || 0,
                cityId: parseInt(formData.cityId) || 0,
                currencyId: parseInt(formData.currencyId) || 0,
                isActive: formData.isActive ?? true,
                createdBy: user?.userId || user?.id || 0,
                modifiedBy: isEdit ? (user?.userId || user?.id || 0) : null,
                spType: isEdit ? 'U' : 'C',
                contacts: (formData.contacts || []).map(c => ({
                    contactId: c.contactId || 0,
                    officeId: editingData?.officeId || 0,
                    contactName: c.contactName,
                    contactNumber: c.contactNumber,
                    contactEmail: c.contactEmail,
                    spType: isEdit && c.contactId ? 'U' : 'C'
                }))
            }

            const response = await manageOffice(payload)
            if (response.data?.success || response.data?.statusCode === 200) {
                toast.success(isEdit ? 'Office updated successfully' : 'Office added successfully')
                fetchOffices()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Operation failed')
            }
        } catch (error) {
            console.error('Error saving office:', error)
            toast.error('Failed to save office')
        }
    }

    const handleDelete = async () => {
        try {
            const payload = {
                officeId: deleteId,
                spType: 'D',
                createdBy: user?.userId || user?.id || 0
            }
            const response = await manageOffice(payload)
            if (response.data?.success || response.data?.statusCode === 200) {
                toast.success('Office deleted successfully')
                fetchOffices()
            } else {
                toast.error(response.data?.message || 'Failed to delete office')
            }
        } catch (error) {
            console.error('Error deleting office:', error)
            toast.error('Failed to delete office')
        } finally {
            setIsDeleteModalOpen(false)
            setDeleteId(null)
        }
    }

    const closeModal = () => {
        setEditingData(null)
        setIsModalOpen(false)
    }

    const closeViewModal = () => {
        setViewData(null)
        setIsViewModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Office Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Offices' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Office</Button>}
            />

            <MastersNavigation />

            <div className="card mt-4">
                <Table
                    columns={columns}
                    data={offices}
                    isLoading={isLoading}
                    emptyMessage="No offices found"
                />
            </div>

            <OfficeFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                editingData={editingData}
                user={user}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Office"
                message="Are you sure you want to delete this office?"
            />

            <OfficeViewModal
                isOpen={isViewModalOpen}
                onClose={closeViewModal}
                office={viewData}
            />
        </div>
    )
}

export default OfficeList
