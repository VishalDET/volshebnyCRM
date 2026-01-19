import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageCurrency } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const CurrencyMaster = () => {
    const { user } = useAuth()
    const [currencies, setCurrencies] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ currencyName: '', currencySign: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchCurrencies()
    }, [])

    const fetchCurrencies = async () => {
        setIsLoading(true)
        try {
            const payload = {
                id: 0,
                currencyName: "string",
                currencySign: "string",
                isActive: true,
                isDeleted: false,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                spType: "R"
            }
            const response = await manageCurrency(payload)
            if (response.data && response.data.data) {
                setCurrencies(response.data.data)
            } else if (Array.isArray(response.data)) {
                setCurrencies(response.data)
            }
        } catch (error) {
            console.error('Error fetching currencies:', error)
            toast.error('Error loading currencies')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'currencyName', label: 'Currency Name' },
        { key: 'currencySign', label: 'Currency Sign' },
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
        setFormData({ currencyName: row.currencyName, currencySign: row.currencySign })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.currencyName || !formData.currencySign) {
            toast.error('Please fill required fields')
            return
        }

        try {
            const payload = {
                id: editingId || 0,
                currencyName: formData.currencyName,
                currencySign: formData.currencySign,
                isActive: true,
                isDeleted: false,
                createdBy: user?.id || 0,
                roleId: user?.roleId || 0,
                spType: editingId ? "U" : "C"
            }

            const response = await manageCurrency(payload)
            const isSuccess = response.data && (
                response.data.isValid === true ||
                response.data.success === true ||
                response.status === 200
            )

            if (isSuccess) {
                toast.success(editingId ? 'Currency updated successfully' : 'Currency added successfully')
                fetchCurrencies()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save currency')
            }
        } catch (error) {
            console.error('Error saving currency:', error)
            toast.error('Error saving currency')
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
                    id: deleteId,
                    currencyName: "",
                    currencySign: "",
                    isActive: true,
                    isDeleted: true,
                    createdBy: user?.id || 0,
                    roleId: user?.roleId || 0,
                    spType: "D"
                }

                const response = await manageCurrency(payload)
                const isSuccess = response.data && (
                    response.data.isValid === true ||
                    response.data.success === true ||
                    response.status === 200
                )

                if (isSuccess) {
                    toast.success('Currency deleted successfully')
                    fetchCurrencies()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete currency')
                }
            } catch (error) {
                console.error('Error deleting currency:', error)
                toast.error('Error deleting currency')
            }
        }
    }

    const closeModal = () => {
        setFormData({ currencyName: '', currencySign: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Currency Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Currencies' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Currency</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={currencies} emptyMessage="No currencies added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Currency" : "Add Currency"}>
                <div className="space-y-4">
                    <Input
                        label="Currency Name"
                        value={formData.currencyName}
                        onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
                        placeholder="E.g. US Dollar"
                    />
                    <Input
                        label="Currency Sign"
                        value={formData.currencySign}
                        onChange={(e) => setFormData({ ...formData, currencySign: e.target.value })}
                        placeholder="E.g. $"
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
                title="Delete Currency"
                message="Are you sure you want to delete this currency?"
            />
        </div>
    )
}

export default CurrencyMaster
