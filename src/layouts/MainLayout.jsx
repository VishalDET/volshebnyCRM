import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'

/**
 * MainLayout Component
 * Main application layout with sidebar navigation and header
 */
const MainLayout = ({ children }) => {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Queries', href: '/queries', icon: '📝' },
        { name: 'Service Vouchers', href: '/vouchers', icon: '🎫' },
        { name: 'Client Invoices', href: '/invoices/client', icon: '💰' },
        { name: 'Supplier Invoices', href: '/invoices/supplier', icon: '📄' },
        { name: 'Finance', href: '/finance', icon: '💵' },
        { name: 'Masters', href: '/masters', icon: '⚙️' },
    ]

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white border-r border-secondary-200 w-64
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-secondary-200">
                        <h1 className="text-2xl font-bold text-primary-600">
                            VolshebnyCRM
                        </h1>
                        <p className="text-xs text-secondary-500 mt-1">Travel Management</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className="flex items-center gap-3 px-4 py-3 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-secondary-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-secondary-900 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-secondary-500 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all`}>
                {/* Header */}
                <header className="bg-white border-b border-secondary-200 sticky top-0 z-30">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                        >
                            <svg
                                className="w-6 h-6 text-secondary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-lg hover:bg-secondary-100 transition-colors relative">
                                <svg
                                    className="w-6 h-6 text-secondary-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default MainLayout
