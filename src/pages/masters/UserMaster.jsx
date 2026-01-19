import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Mail, Phone, Building } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '@components/Button'
import Input from '@components/Input'
import { manageUser, manageUserRoleMapping } from '@api/userRole.api'
import { useAuth } from '@hooks/useAuth'

const UserMaster = () => {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        emailId: '',
        mobileNo: '',
        companyName: '',
        password: '', // Only for creation if needed, though API desc doesn't strictly show password field in RQ. Assuming it handles it or generic "manage" might not set password directly? 
        role: 'Handler'
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await manageUser({
                id: 0,
                spType: 'R',
                isActive: true,
                isDeleted: true,
                roleId: 0,
                createdBy: 0,
                modifiedBy: 0
            })
            // API returns { statusCode, success, message, data: [...], totalCount, error }
            const userData = response.data?.data || []

            // Fetch role information for each user
            const usersWithRoles = await Promise.all(
                userData.map(async (user) => {
                    try {
                        const roleResponse = await manageUserRoleMapping({
                            userRoleId: 0,
                            userId: user.id,
                            roleId: 0,
                            isDeleted: true,
                            createdBy: 0,
                            spType: 'R'
                        })
                        const roleData = roleResponse.data?.data?.[0]
                        return {
                            ...user,
                            roleName: roleData?.roleName || 'Handler',
                            roleId: roleData?.roleId || 2
                        }
                    } catch (error) {
                        console.error(`Failed to fetch role for user ${user.id}`, error)
                        return {
                            ...user,
                            roleName: 'Handler',
                            roleId: 2
                        }
                    }
                })
            )

            setUsers(Array.isArray(usersWithRoles) ? usersWithRoles : [])
        } catch (error) {
            toast.error('Failed to fetch users')
            console.error(error)
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
        return fullName.includes(searchTerm.toLowerCase()) ||
            (user.emailId || '').toLowerCase().includes(searchTerm.toLowerCase())
    })

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode)
        if (mode === 'edit' && user) {
            setSelectedUser(user)
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                emailId: user.emailId || '',
                mobileNo: user.mobileNo || '',
                companyName: user.companyName || '',
                role: user.roleName || 'Handler',
                password: ''
            })
        } else {
            setSelectedUser(null)
            setFormData({
                firstName: '',
                lastName: '',
                emailId: '',
                mobileNo: '',
                companyName: '',
                password: '',
                role: 'Handler'
            })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                id: modalMode === 'edit' ? (selectedUser.id || selectedUser.uid) : 0,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobileNo: formData.mobileNo,
                companyName: formData.companyName,
                emailId: formData.emailId,

                // When editing, preserve existing fields that aren't in the form
                ...(modalMode === 'edit' && selectedUser ? {
                    address: selectedUser.address || "",
                    landmark: selectedUser.landmark || "",
                    gstNumber: selectedUser.gstNumber || "",
                    isGSTIN: selectedUser.isGSTIN || false,
                    countryId: selectedUser.countryId || 0,
                    stateId: selectedUser.stateId || 0,
                    cityId: selectedUser.cityId || 0,
                    pincode: selectedUser.pincode || "",
                } : {}),

                authority: "",
                createdBy: currentUser?.id || 0,
                roleId: currentUser?.roleId || 0,
                modifiedBy: currentUser?.id || 0,
                isActive: true,
                spType: modalMode === 'add' ? 'C' : 'U'
            }

            const userResponse = await manageUser(payload)

            // Get the user ID from response or use existing ID
            const userId = modalMode === 'add'
                ? userResponse.data?.data?.[0]?.id || userResponse.data?.data?.id || userResponse.data?.data
                : (selectedUser.id || selectedUser.uid)

            // Map role name to role ID (1 for SuperAdmin, 2 for Handler)
            const roleId = formData.role.toLowerCase() === 'superadmin' ? 1 : 2

            // Create or update role mapping: Use 'C' for create, 'U' for update as per requirement
            await manageUserRoleMapping({
                userRoleId: 0,
                userId: userId,
                roleId: roleId,
                isDeleted: false,
                createdBy: currentUser?.id || 0,
                spType: modalMode === 'add' ? 'C' : 'U'
            })

            toast.success(`User ${modalMode === 'add' ? 'created' : 'updated'} successfully`)
            setShowModal(false)
            fetchUsers()
        } catch (error) {
            console.error('Submit error:', error)
            toast.error(error.response?.data?.message || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const payload = {
                    id: id,
                    firstName: "",
                    lastName: "",
                    mobileNo: "",
                    companyName: "",
                    emailId: "",
                    isGSTIN: false,
                    gstNumber: "",
                    address: "",
                    landmark: "",
                    authority: "",
                    countryId: 0,
                    stateId: 0,
                    cityId: 0,
                    pincode: "",
                    createdBy: currentUser?.id || 0,
                    roleId: currentUser?.roleId || 0,
                    modifiedBy: currentUser?.id || 0,
                    isActive: false,
                    spType: 'D'
                }
                await manageUser(payload)
                toast.success('User deleted successfully')
                fetchUsers()
            } catch (error) {
                toast.error('Failed to delete user')
            }
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <Button onClick={() => handleOpenModal('add')} className="flex items-center gap-2">
                    <Plus size={20} /> Add User
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id || user.uid} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                            {user.companyName && <div className="text-xs text-gray-500 flex items-center gap-1"><Building size={12} /> {user.companyName}</div>}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex items-center gap-2 text-sm"><Mail size={14} /> {user.emailId}</div>
                                            {user.mobileNo && <div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><Phone size={14} /> {user.mobileNo}</div>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${(user.roleName || user.role) === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                                                    (user.roleName || user.role) === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.roleName || user.role || 'User'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('edit', user)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id || user.uid)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold bg-white">{modalMode === 'add' ? 'Add User' : 'Edit User'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.emailId}
                                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                                    disabled={modalMode === 'edit'}
                                    required
                                />
                                <Input
                                    label="Mobile No"
                                    value={formData.mobileNo}
                                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Company Name"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="Handler">Handler</option>
                                    <option value="SuperAdmin">Super Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">{modalMode === 'add' ? 'Create User' : 'Save Changes'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserMaster
