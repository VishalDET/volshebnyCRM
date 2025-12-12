import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'

const CurrencyMaster = () => {
    const [currencies, setCurrencies] = useState([
        { id: 1, name: 'US Dollar', sign: '$' },
        { id: 2, name: 'Indian Rupee', sign: '₹' },
        { id: 3, name: 'Euro', sign: '€' }
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', sign: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const columns = [
        { key: 'name', label: 'Currency Name' },
        { key: 'sign', label: 'Currency Sign' },
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
        setFormData({ name: row.name, sign: row.sign })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.name || !formData.sign) return

        if (editingId) {
            setCurrencies(currencies.map(c => c.id === editingId ? { ...c, ...formData } : c))
        } else {
            setCurrencies([...currencies, { id: Date.now(), ...formData }])
        }

        closeModal()
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            setCurrencies(currencies.filter(c => c.id !== deleteId))
            setDeleteId(null)
            setIsDeleteModalOpen(false)
        }
    }

    const closeModal = () => {
        setFormData({ name: '', sign: '' })
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
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="E.g. US Dollar"
                    />
                    <Input
                        label="Currency Sign"
                        value={formData.sign}
                        onChange={(e) => setFormData({ ...formData, sign: e.target.value })}
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
