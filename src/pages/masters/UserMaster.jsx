import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import Modal from '@components/Modal'
import Input from '@components/Input'
import Select from '@components/Select'
import { Pencil, Trash2, Eye, Mail, Phone, Building, Shield } from 'lucide-react'
import MastersNavigation from '@components/MastersNavigation'
import ConfirmModal from '@components/ConfirmModal'
import { manageUser, getAllRoles } from '@api/userRole.api'
import { manageCountry, manageCity, manageOffice } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const UserMaster = () => {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [countries, setCountries] = useState([])
    const [cityOptions, setCityOptions] = useState([])
    const [offices, setOffices] = useState([])
    const [roles, setRoles] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [viewData, setViewData] = useState(null)

    const initialFormState = {
        firstName: '',
        lastName: '',
        mobileNo: '',
        companyName: '',
        emailId: '',
        address: '',
        landmark: '',
        authority: '',
        officeId: '',
        countryId: '',
        stateId: 0,
        cityId: '',
        pincode: '',
        roleId: '',
        isActive: true,
        password: '',
        passwordHash: '',
        spType: 'R'
    }

    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        fetchInitialData()
        fetchUsers()
    }, [])

    const fetchInitialData = async () => {
        try {
            // Fetch Countries
            const countryRes = await manageCountry({ spType: 'R', isActive: true })
            if (countryRes.data?.data) {
                setCountries(countryRes.data.data.map(c => ({ value: c.countryId, label: c.countryName })))
            }

            // Fetch Offices — spType 'R' = fetch all, spType 'E' = fetch single by officeId
            const officeRes = await manageOffice({ spType: 'R', isActive: true })
            if (officeRes.data?.data) {
                setOffices(officeRes.data.data.map(o => ({ value: o.officeId, label: o.officeName.trim() })))
            }

            // Fetch Roles
            const roleRes = await getAllRoles()
            const roleData = roleRes.data?.data || roleRes.data || []
            if (Array.isArray(roleData)) {
                setRoles(roleData.map(r => ({ value: r.roleId, label: r.roleName })))
            }
        } catch (error) {
            console.error('Error fetching dependency data:', error)
        }
    }

    const fetchCities = async (countryId) => {
        if (!countryId) return
        try {
            const res = await manageCity({ countryId: parseInt(countryId), spType: 'R', isActive: true })
            if (res.data?.data) {
                setCityOptions(res.data.data.map(c => ({ value: c.cityId, label: c.cityName })))
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
        }
    }

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            // roleId and authority are returned directly by ManageUser API
            const response = await manageUser({ spType: 'R', isActive: true })
            setUsers(response.data?.data || [])
        } catch (error) {
            toast.error('Failed to load users')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (user) => {
        setEditingId(user.id)
        if (user.countryId) fetchCities(user.countryId)
        setFormData({
            ...initialFormState,
            ...user,
            password: '',
            passwordHash: '',
            officeId: user.officeId ? user.officeId.toString() : '',
            countryId: user.countryId ? user.countryId.toString() : '',
            cityId: user.cityId ? user.cityId.toString() : '',
            roleId: user.roleId ? user.roleId.toString() : ''
        })
        setIsModalOpen(true)
    }

    const handleView = (user) => {
        setViewData(user)
        setIsViewModalOpen(true)
    }

    const confirmDelete = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        try {
            await manageUser({ id: deleteId, spType: 'D', isActive: false })
            toast.success('User deleted successfully')
            fetchUsers()
            setIsDeleteModalOpen(false)
        } catch (error) {
            toast.error('Failed to delete user')
        }
    }

    const handleSave = async () => {
        if (!formData.firstName || !formData.emailId) {
            toast.error('First Name and Email are required')
            return
        }
        if (!editingId && !formData.password) {
            toast.error('Password is required for new users')
            return
        }

        try {
            setIsLoading(true)
            const selectedRole = roles.find(r => r.value === parseInt(formData.roleId))
            const payload = {
                ...formData,
                id: editingId || 0,
                password: (editingId && !formData.password) ? null : formData.password,
                passwordHash: (editingId && !formData.password) ? null : formData.password,
                officeId: parseInt(formData.officeId) || 0,
                countryId: parseInt(formData.countryId) || 0,
                cityId: parseInt(formData.cityId) || 0,
                stateId: parseInt(formData.stateId) || 0,
                roleId: parseInt(formData.roleId) || 0,
                roleName: selectedRole?.label || '',
                createdBy: editingId ? formData.createdBy : (currentUser?.id || 0),
                modifiedBy: currentUser?.id || 0,
                spType: editingId ? 'U' : 'C'
            }

            // roleId is sent directly with the user payload — no separate role mapping call needed
            await manageUser(payload)

            toast.success(`User ${editingId ? 'updated' : 'added'} successfully`)
            closeModal()
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed')
        } finally {
            setIsLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
        setFormData(initialFormState)
        setCityOptions([])
    }

    const columns = [
        {
            key: 'name',
            label: 'User Details',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-secondary-900">{row.firstName} {row.lastName}</span>
                    <span className="text-xs text-secondary-500 flex items-center gap-1"><Building size={12} /> {row.officeName || 'No Company'}</span>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Contact',
            render: (_, row) => (
                <div className="flex flex-col text-sm">
                    <span className="flex items-center gap-1"><Mail size={12} /> {row.emailId}</span>
                    <span className="flex items-center gap-1 text-secondary-500"><Phone size={12} /> {row.mobileNo || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'office',
            label: 'Office & Role',
            render: (_, row) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium">{offices.find(o => o.value === parseInt(row.officeId))?.label || 'No Office'}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full w-fit mt-1 flex items-center gap-1">
                        <Shield size={10} /> {{ 1: 'SuperAdmin', 2: 'Handler' }[row.roleId] || 'N/A'}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleView(row)} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                    </button>
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

    return (
        <div>
            <PageHeader
                title="User & Employee Master"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Masters' }, { label: 'Users' }]}
                actions={<Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add User</Button>}
            />

            <MastersNavigation />

            <div className="card">
                <Table columns={columns} data={users} isLoading={isLoading} emptyMessage="No users found" />
            </div>

            {/* Form Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit User" : "Add User"} size="xl">
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary-800 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name *"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Enter first name"
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Enter last name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Email ID *"
                                type="email"
                                value={formData.emailId}
                                onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                                placeholder="name@company.com"
                                disabled={!!editingId}
                            />
                            <Input
                                label="Mobile No"
                                value={formData.mobileNo}
                                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                                placeholder="Enter mobile number"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label={editingId ? "New Password (leave blank to keep current)" : "Create Password *"}
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value, passwordHash: e.target.value })}
                                placeholder="Enter password"
                            />
                            <Input
                                label="Company Name"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Enter company name"
                            />
                        </div>
                    </div>

                    {/* Work & Access */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary-800 border-b pb-2">Work &amp; Access</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Reporting Office"
                                value={formData.officeId}
                                options={offices}
                                onChange={(e) => setFormData({ ...formData, officeId: e.target.value })}
                                placeholder="Select Office"
                            />
                            <Select
                                label="Access Role"
                                value={formData.roleId}
                                options={roles}
                                onChange={(e) => {
                                    const role = roles.find(r => r.value === parseInt(e.target.value))
                                    setFormData({ ...formData, roleId: e.target.value, authority: role?.label || '' })
                                }}
                                placeholder="Select Role"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Authority Detail"
                                value={formData.authority}
                                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                                placeholder="Designation / Authority Level"
                            />
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary-800 border-b pb-2">Address Details</h3>
                        <Input
                            label="Residential Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Full address"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Landmark"
                                value={formData.landmark}
                                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                placeholder="Near..."
                            />
                            <Input
                                label="Pincode"
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                placeholder="000000"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Country"
                                value={formData.countryId}
                                options={countries}
                                onChange={(e) => {
                                    setFormData({ ...formData, countryId: e.target.value, cityId: '' })
                                    fetchCities(e.target.value)
                                }}
                                placeholder="Select Country"
                            />
                            <Select
                                label="City"
                                value={formData.cityId}
                                options={cityOptions}
                                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                placeholder="Select City"
                                disabled={!formData.countryId}
                            />
                        </div>
                    </div>


                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
                        {editingId ? 'Update User' : 'Create User'}
                    </Button>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Details" size="lg">
                {viewData && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b pb-4">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                {viewData.firstName?.[0]}{viewData.lastName?.[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{viewData.firstName} {viewData.lastName}</h2>
                                <p className="text-secondary-500">{viewData.authority || viewData.roleName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <label className="text-secondary-500 block">Email</label>
                                <span className="font-medium">{viewData.emailId}</span>
                            </div>
                            <div>
                                <label className="text-secondary-500 block">Mobile</label>
                                <span className="font-medium">{viewData.mobileNo || 'N/A'}</span>
                            </div>
                            <div>
                                <label className="text-secondary-500 block">Company</label>
                                <span className="font-medium">{viewData.companyName || 'N/A'}</span>
                            </div>
                            <div>
                                <label className="text-secondary-500 block">Office</label>
                                <span className="font-medium">{offices.find(o => o.value === parseInt(viewData.officeId))?.label || 'N/A'}</span>
                            </div>
                            <div className="col-span-2">
                                <label className="text-secondary-500 block">Address</label>
                                <span className="font-medium">
                                    {viewData.address}{viewData.landmark && `, ${viewData.landmark}`}
                                    {viewData.cityId && `, ${cityOptions.find(c => c.value === viewData.cityId)?.label}`}
                                    {viewData.pincode && ` - ${viewData.pincode}`}
                                </span>
                            </div>
                            {viewData.isGSTIN && (
                                <div>
                                    <label className="text-secondary-500 block">GST Number</label>
                                    <span className="font-medium">{viewData.gstNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${users.find(u => u.id === deleteId)?.firstName}? This action cannot be undone.`}
            />
        </div>
    )
}

export default UserMaster
