import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'

const CreditCardMaster = () => {
    const [cards, setCards] = useState([
        { id: 1, bankName: 'HDFC Bank' },
        { id: 2, bankName: 'ICICI Bank' },
        { id: 3, bankName: 'SBI' }
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ bankName: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

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
                    <button onClick={() => confirmDelete(row.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleEdit = (row) => {
        setFormData({ bankName: row.bankName })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.bankName) return

        if (editingId) {
            setCards(cards.map(c => c.id === editingId ? { ...c, ...formData } : c))
        } else {
            setCards([...cards, { id: Date.now(), ...formData }])
        }

        closeModal()
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            setCards(cards.filter(c => c.id !== deleteId))
            setDeleteId(null)
            setIsDeleteModalOpen(false)
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
