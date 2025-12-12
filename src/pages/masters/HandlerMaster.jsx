import { useState } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'
import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'

const HandlerMaster = () => {
    const [handlers, setHandlers] = useState([
        { id: 1, name: 'John Smith', mail: 'john.smith@example.com', handlerId: 'EMP001' },
        { id: 2, name: 'Sarah Jones', mail: 'sarah.jones@example.com', handlerId: 'EMP002' }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', mail: '', handlerId: '' })
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const columns = [
        { key: 'name', label: 'Handler Name' },
        { key: 'mail', label: 'Email Address' },
        { key: 'handlerId', label: 'Handler ID' },
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
            name: row.name,
            mail: row.mail,
            handlerId: row.handlerId
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.name || !formData.mail || !formData.handlerId) return

        if (editingId) {
            setHandlers(handlers.map(h => h.id === editingId ? { ...h, ...formData } : h))
        } else {
            setHandlers([...handlers, { id: Date.now(), ...formData }])
        }

        closeModal()
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            setHandlers(handlers.filter(h => h.id !== deleteId))
            setDeleteId(null)
            setIsDeleteModalOpen(false)
        }
    }

    const closeModal = () => {
        setFormData({ name: '', mail: '', handlerId: '' })
        setEditingId(null)
        setIsModalOpen(false)
    }

    return (
        <div>
            <PageHeader
                title="Handler Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Handlers' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Handler</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={handlers} emptyMessage="No handlers added" />
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Handler" : "Add Handler"}>
                <div className="space-y-4">
                    <Input
                        label="Handler Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.mail}
                        onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                        placeholder="john@example.com"
                    />
                    <Input
                        label="Handler ID"
                        value={formData.handlerId}
                        onChange={(e) => setFormData({ ...formData, handlerId: e.target.value })}
                        placeholder="e.g. EMP123"
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
                title="Delete Handler"
                message="Are you sure you want to delete this handler?"
            />
        </div>
    )
}

export default HandlerMaster
