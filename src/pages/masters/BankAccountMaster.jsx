import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2, Eye } from 'lucide-react'

import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageBankAccount } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const BankAccountMaster = () => {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const initialForm = {
        accountName: '',
        address: '',
        bankName: '',
        bankAddress: '',
        accountNumber: '',
        ibanNumber: '',
        swiftCode: '',
        correspondentAccountNumber: '',
        correspondentSwiftCode: '',
        correspondentAddress: '',
        isActive: true,
        spType: 'R'
    }

    const [formData, setFormData] = useState(initialForm)
    const [editingId, setEditingId] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewItem, setViewItem] = useState(null)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setIsLoading(true)
        try {
            const payload = {
                id: 0,
                accountName: "string",
                address: "string",
                bankName: "string",
                bankAddress: "string",
                accountNumber: "string",
                ibanNumber: "string",
                swiftCode: "string",
                correspondentAccountNumber: "string",
                correspondentSwiftCode: "string",
                correspondentAddress: "string",
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const res = await manageBankAccount(payload)
            if (res.data && res.data.data) setItems(res.data.data)
            else if (Array.isArray(res.data)) setItems(res.data)
        } catch (err) {
            console.error('Error fetching bank accounts', err)
            toast.error('Failed to load bank accounts')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        { key: 'accountName', label: 'Account Name' },
        { key: 'bankName', label: 'Bank' },
        { key: 'accountNumber', label: 'Account No.' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleView(row)} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50" title="View">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirmDelete(row.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const handleAdd = () => {
        setFormData(initialForm)
        setEditingId(null)
        setIsModalOpen(true)
    }

    const handleView = async (row) => {
        setIsLoading(true)
        try {
            const payload = { ...row, spType: 'E', id: row.id, roleId: user?.roleId || 0, createdBy: user?.id || 0, modifiedBy: user?.id || 0 }
            const res = await manageBankAccount(payload)
            let data = row
            if (res.data && res.data.data && res.data.data[0]) data = res.data.data[0]
            else if (Array.isArray(res.data) && res.data[0]) data = res.data[0]

            setViewItem(data)
            setIsViewModalOpen(true)
        } catch (err) {
            console.error('Error fetching bank account', err)
            toast.error('Failed to load details')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = async (row) => {
        setIsLoading(true)
        try {
            const payload = { id: row.id, spType: 'E', roleId: user?.roleId || 0, createdBy: user?.id || 0, modifiedBy: user?.id || 0 }
            const res = await manageBankAccount(payload)
            let data = row
            if (res.data && res.data.data && res.data.data[0]) data = res.data.data[0]
            else if (Array.isArray(res.data) && res.data[0]) data = res.data[0]

            setFormData({
                accountName: data.accountName || '',
                address: data.address || '',
                bankName: data.bankName || '',
                bankAddress: data.bankAddress || '',
                accountNumber: data.accountNumber || '',
                ibanNumber: data.ibanNumber || '',
                swiftCode: data.swiftCode || '',
                correspondentAccountNumber: data.correspondentAccountNumber || '',
                correspondentSwiftCode: data.correspondentSwiftCode || '',
                correspondentAddress: data.correspondentAddress || '',
                isActive: data.isActive ?? true,
                spType: 'U'
            })
            setEditingId(data.id)
            setIsModalOpen(true)
        } catch (err) {
            console.error('Error fetching bank account for edit', err)
            toast.error('Failed to load for edit')
        } finally {
            setIsLoading(false)
        }
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const payload = { id: deleteId, spType: 'D', roleId: user?.roleId || 0, createdBy: user?.id || 0 }
            const res = await manageBankAccount(payload)
            if (res.data && (res.data.success || res.status === 200)) {
                toast.success('Deleted')
                fetchItems()
            } else {
                toast.error(res.data?.message || 'Delete failed')
            }
        } catch (err) {
            console.error('Delete error', err)
            toast.error('Delete failed')
        } finally {
            setIsDeleteModalOpen(false)
            setDeleteId(null)
        }
    }

    const handleSave = async () => {
        if (!formData.accountName || !formData.accountNumber) {
            toast.error('Please fill required fields')
            return
        }

        try {
            const payload = {
                id: editingId || 0,
                accountName: formData.accountName || '',
                address: formData.address || '',
                bankName: formData.bankName || '',
                bankAddress: formData.bankAddress || '',
                accountNumber: formData.accountNumber || '',
                ibanNumber: formData.ibanNumber || '',
                swiftCode: formData.swiftCode || '',
                correspondentAccountNumber: formData.correspondentAccountNumber || '',
                correspondentSwiftCode: formData.correspondentSwiftCode || '',
                correspondentAddress: formData.correspondentAddress || '',
                roleId: user?.roleId || 0,
                createdBy: user?.id || 0,
                modifiedBy: user?.id || 0,
                isActive: formData.isActive ?? true,
                spType: editingId ? 'U' : 'C'
            }

            const res = await manageBankAccount(payload)
            if (res.data && (res.data.success || res.status === 200)) {
                toast.success(editingId ? 'Updated' : 'Added')
                fetchItems()
                setIsModalOpen(false)
            } else {
                toast.error(res.data?.message || 'Save failed')
            }
        } catch (err) {
            console.error('Save error', err)
            toast.error('Save failed')
        }
    }

    return (
        <div>
            <PageHeader
                title="Bank Accounts"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Bank Accounts' }]}
                actions={<Button variant="primary" onClick={handleAdd}>+ Add Bank Account</Button>}
            />

            <MastersNavigation />

            <div className="card mt-4">
                <Table columns={columns} data={items} isLoading={isLoading} emptyMessage="No bank accounts found" />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Bank Account' : 'Add Bank Account'}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Account Name" value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} />
                        <Input label="Account Number" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
                        <Input label="Bank Name" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
                        <Input label="IBAN" value={formData.ibanNumber} onChange={(e) => setFormData({ ...formData, ibanNumber: e.target.value })} />
                        <Input label="SWIFT" value={formData.swiftCode} onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })} />
                        <Input label="Bank Address" value={formData.bankAddress} onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })} />
                        <Input label="Correspondent Account" value={formData.correspondentAccountNumber} onChange={(e) => setFormData({ ...formData, correspondentAccountNumber: e.target.value })} />
                        <Input label="Correspondent SWIFT" value={formData.correspondentSwiftCode} onChange={(e) => setFormData({ ...formData, correspondentSwiftCode: e.target.value })} />
                        <Input label="Correspondent Address" value={formData.correspondentAddress} onChange={(e) => setFormData({ ...formData, correspondentAddress: e.target.value })} />
                        <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Bank Account">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {viewItem && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Account Name</label>
                                <p>{viewItem.accountName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Bank Name</label>
                                <p>{viewItem.bankName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Account Number</label>
                                <p>{viewItem.accountNumber}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">IBAN</label>
                                <p>{viewItem.ibanNumber}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">SWIFT</label>
                                <p>{viewItem.swiftCode}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Bank Address</label>
                                <p>{viewItem.bankAddress}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Correspondent Account</label>
                                <p>{viewItem.correspondentAccountNumber}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Correspondent SWIFT</label>
                                <p>{viewItem.correspondentSwiftCode}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-500">Correspondent Address</label>
                                <p>{viewItem.correspondentAddress}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-500">Address</label>
                                <p>{viewItem.address}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} title="Delete Bank Account" message="Are you sure you want to delete this bank account?" />
        </div>
    )
}

export default BankAccountMaster
