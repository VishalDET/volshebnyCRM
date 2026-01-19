import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import { Pencil, Trash2 } from 'lucide-react'
import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageHandler } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const HandlerMaster = () => {
    const { user } = useAuth()
    const [handlers, setHandlers] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const initialFormState = {
        handlerName: '',
        emailId: '',
        mobileNo: '',
        handlerId: '',
        roleId: 0,
        createdBy: 0,
        modifiedBy: 0,
        isActive: true
    }

    const [formData, setFormData] = useState(initialFormState)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        fetchHandlers()
    }, [])

    const fetchHandlers = async () => {
        setIsLoading(true)
        try {
            const payload = {
                id: 0,
                handlerId: "string",
                handlerName: "string",
                emailId: "string",
                mobileNo: "string",
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                isDeleted: false,
                spType: "R"
            }

            const res = await manageHandler(payload)
            console.log("RAW RES:", res)

            const apiData =
                res?.data?.data ||   // axios full response
                res?.data ||         // interceptor response
                []

            if (Array.isArray(apiData)) {
                setHandlers(apiData)
                console.log("SET HANDLERS:", apiData)
            }
        } catch (err) {
            console.error(err)
            toast.error("Error loading handlers")
        } finally {
            setIsLoading(false)
        }
    }




    const columns = [
        { key: 'handlerName', label: 'Handler Name' },
        { key: 'emailId', label: 'Email Address' },
        { key: 'mobileNo', label: 'Phone Number' },
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
            handlerName: row.handlerName || '',
            emailId: row.emailId || '',
            mobileNo: row.mobileNo || '',
            handlerId: row.handlerId || '',
            roleId: row.roleId || 0,
            createdBy: row.createdBy || 0,
            modifiedBy: row.modifiedBy || 0,
            isActive: row.isActive ?? true
        })
        setEditingId(row.id)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!formData.handlerName || !formData.emailId || !formData.handlerId) {
            toast.error('Please fill required fields (Name, Email, Handler ID)')
            return
        }

        try {
            const payload = {
                id: editingId || 0,
                handlerName: formData.handlerName,
                emailId: formData.emailId,
                mobileNo: formData.mobileNo || "",
                handlerId: formData.handlerId,
                roleId: user?.roleId || 0,
                createdBy: user?.id || 0,
                modifiedBy: user?.id || 0,
                isActive: true,
                spType: editingId ? "U" : "C"
            }

            const response = await manageHandler(payload)

            const isSuccess = response.data && (
                response.data.success === true ||
                response.status === 200 ||
                response.data.isValid === true
            )

            if (isSuccess) {
                toast.success(editingId ? 'Handler updated successfully' : 'Handler added successfully')
                fetchHandlers()
                closeModal()
            } else {
                toast.error(response.data?.message || 'Failed to save handler')
            }
        } catch (error) {
            console.error('Error saving handler:', error)

            let errorMessage = 'Error saving handler'
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.response?.data?.errors) {
                errorMessage = JSON.stringify(error.response.data.errors)
            } else if (error.response?.data) {
                console.error('Backend response:', error.response.data)
                errorMessage = 'Backend error: ' + (error.response.data.title || 'See console for details')
            }

            toast.error(errorMessage)
        }
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const payload = {
                id: deleteId,
                handlerId: "NA",
                handlerName: "NA",
                emailId: "na@na.com",
                mobileNo: "",
                roleId: user?.roleId || 0,
                createdBy: user?.id || 0,
                modifiedBy: user?.id || 0,
                isActive: false,
                spType: "D"
            }

            const res = await manageHandler(payload)
            console.log("DELETE RES:", res)

            if (res?.data?.success || res?.data?.isValid) {
                toast.success("Handler deleted successfully")
                fetchHandlers()
                setDeleteId(null)
                setIsDeleteModalOpen(false)
            } else {
                toast.error(res?.data?.message || "Failed to delete handler")
            }
        } catch (err) {
            console.error("Error deleting handler:", err)
            toast.error("Error deleting handler")
        }
    }


    const closeModal = () => {
        setFormData(initialFormState)
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
                        label="Handler Name *"
                        value={formData.handlerName}
                        onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
                        placeholder="Enter full name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Email Address *"
                            type="email"
                            value={formData.emailId}
                            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={formData.mobileNo}
                            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                            placeholder="1234567890"
                        />
                    </div>
                    <Input
                        label="Handler ID *"
                        value={formData.handlerId}
                        onChange={(e) => setFormData({ ...formData, handlerId: e.target.value })}
                        placeholder="e.g. EMP123"
                    />
                    <Input
                        label="Role ID"
                        type="number"
                        value={formData.roleId}
                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                        placeholder="0"
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

