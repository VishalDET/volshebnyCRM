import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@hooks/useAuth'
import { User, Mail, Shield, Key } from 'lucide-react'
import Button from '@components/Button'
import EditProfileModal from '@components/EditProfileModal'
import { setUser } from '@redux/authSlice'
import { getUserProfileByEmail } from '@api/userRole.api'

const UserProfile = () => {
    const { user } = useAuth()
    const dispatch = useDispatch()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.email) {
            fetchProfile(user.email)
        }
    }, [user?.email])

    const fetchProfile = async (email) => {
        try {
            setLoading(true)
            const response = await getUserProfileByEmail(email)
            const profileData = response.data?.data

            if (profileData) {
                const mappedUser = {
                    ...user,
                    id: profileData.userId,
                    userId: profileData.userId, // Added for display as requested
                    name: profileData.fullName,
                    email: profileData.emailId,
                    roleId: profileData.roleId,
                    role: profileData.roleName, // Use roleName, ignore Authority
                    roleName: profileData.roleName,
                    mobileNo: profileData.mobileNo,
                    companyName: profileData.companyName,
                    isActive: profileData.isActive
                }

                dispatch(setUser(mappedUser))
                localStorage.setItem('user', JSON.stringify(mappedUser))
                localStorage.setItem('userId', mappedUser.userId)
                localStorage.setItem('roleId', mappedUser.roleId)
                sessionStorage.setItem('userId', mappedUser.userId)
                sessionStorage.setItem('roleId', mappedUser.roleId)
            }
        } catch (error) {
            console.error('Failed to fetch user data', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSuccess = async () => {
        if (user?.email) {
            await fetchProfile(user.email)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header with Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
                        <p className="text-slate-500 text-sm">Manage your personal information</p>
                    </div>
                    {/* <Button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
                    >
                        Edit Profile
                    </Button> */}
                </div>

                {/* Simplified Hero Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    {/* <div className="h-32 sm:h-48 bg-gradient-to-br from-indigo-600 to-blue-700 relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div> */}

                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-white">
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.name || 'User'}
                                            className="w-full h-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                                            <User className="w-10 h-10 sm:w-16 sm:h-16" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center sm:text-left mb-2">
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                    {user?.name || 'User Name'}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                        {user?.roleName || user?.role || 'Member'}
                                    </span>
                                    <span className="text-slate-400 text-xs font-medium">
                                        ID: {user?.userId || user?.id || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Contact</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                                        <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                                        <p className="text-sm font-medium text-emerald-600">Active Account</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                Workspace Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Company Name</p>
                                    <p className="text-slate-900 font-semibold">{user?.companyName || 'Not specified'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Official Role</p>
                                    <p className="text-slate-900 font-semibold">{user?.roleName || 'User'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Permissions</p>
                                    <p className="text-slate-600 text-sm">Full access to masters and dashboard tracking.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div>
    )
}

export default UserProfile

