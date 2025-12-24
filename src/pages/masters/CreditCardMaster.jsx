import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageCreditcards } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const CreditCardMaster = () => {
    const [cards, setCards] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ bankName: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchCards()
    }, [])

    const fetchCards = async () => {
        setIsLoading(true)
        try {
            const payload = {
                bankId: 0,
                bankName: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const response = await manageCreditcards(payload)
            console.log('Cards Response:', response.data)

            if (response.data) {
                if (Array.isArray(response.data)) {
                    setCards(response.data)
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    setCards(response.data.data)
                } else if (response.data.success && response.data.data) {
                    setCards(response.data.data)
                } else {
                    console.log('Unexpected response structure:', response.data)
                    toast.error('Unexpected response format')
                }
            } else {
                toast.error('Failed to fetch credit cards')
            }
        } catch (error) {
            console.error('Error fetching cards:', error)
            toast.error('Error loading credit cards')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'bankName', label: 'Bank Name' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.bankId)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = (row) => {
        setFormData({ bankName: row.bankName })
        setEditingId(row.bankId)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.bankName) {
            toast.error('Please enter bank name')
            return
        }

        try {
            const payload = {
                bankId: editingId || 0,
                bankName: formData.bankName,
                isActive: true,
                isDeleted: false,
                spType: editingId ? "U" : "C"
            }

            const response = await manageCreditcards(payload)
            console.log('Save Response:', response.data)

            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200 ||
                response.data.isValid === true
            )

            if (isSuccess) {
                toast.success(editingId ? 'Bank updated successfully' : 'Bank added successfully')
                fetchCards()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save bank')
            }
        } catch (error) {
            console.error('Error saving bank:', error)
            toast.error('Error saving bank')
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
                    bankId: deleteId,
                    bankName: "",
                    isActive: true,
                    isDeleted: true,
                    spType: "D"
                }

                const response = await manageCreditcards(payload)
                console.log('Delete Response:', response.data)

                const isSuccess = response.data && (
                    response.data.success === true ||
                    response.status === 200 ||
                    response.data.isValid === true
                )

                if (isSuccess) {
                    toast.success('Bank deleted successfully')
                    fetchCards()
                    setDeleteId(null)
                    setIsDeleteModalOpen(false)
                } else {
                    toast.error(response.data?.message || 'Failed to delete bank')
                }
            } catch (error) {
                console.error('Error deleting bank:', error)
                toast.error('Error deleting bank')
            }
        }
    }

    const closeModal = () => {
        setFormData({ bankName: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Credit Card Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Credit Cards' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Bank</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={cards} emptyMessage="No banks added" />
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Bank" : "Add Bank"}>
                <div className="space-y-4">
                    <Input
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="E.g. HDFC Bank"
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
                title="Delete Credit Card"
                message="Are you sure you want to delete this bank?"
            />
        </div>
    )
}

export default CreditCardMaster
