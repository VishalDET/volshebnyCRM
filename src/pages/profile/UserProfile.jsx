import { useAuth } from '@hooks/useAuth'
import { User, Mail, Shield, Key } from 'lucide-react'
import Button from '@components/Button'

const UserProfile = () => {
    const { user } = useAuth()

    return (
        <div className="max-w-4xl mx-auto p-6 rounded-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="px-6 pb-8">
                    <div className="relative flex justify-start items-center -mt-12 mb-6 bg-gradient-to-r from-blue-500 to-indigo-600
                                    border-2 border-white p-2 rounded-xl">
                        <div className="flex items-end">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.name || 'User'}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='flex items-center justify-between w-full'>
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-100">{user?.name || 'User Name'}</h2>
                                <p className="text-gray-300 text-sm">Member since {new Date().getFullYear()}</p>
                            </div>
                            <Button variant="outline" className="bg-white text-gray-900 hover:bg-gray-100 border border-gray-200">
                                Edit Profile
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                            <div className="flex items-center gap-3 text-gray-700">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium">{user?.name || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Details</h3>

                            <div className="flex items-center gap-3 text-gray-700">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                        {user?.role || 'Guest'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <Key className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-mono text-xs bg-gray-50 px-2 py-1 rounded text-gray-600">{user?.uid || user?.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile
