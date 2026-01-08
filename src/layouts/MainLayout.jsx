import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import {
    LayoutDashboard,
    FileText,
    Ticket,
    Receipt,
    FileSignature,
    Landmark,
    Settings,
    LogOut,
    Menu,
    Bell,
    ChevronDown
} from 'lucide-react'

const MainLayout = ({ children }) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { user, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const navigation = [
        {
            title: 'MAIN',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: 'OPERATIONS',
            items: [
                { name: 'Queries', href: '/queries', icon: FileText },
                { name: 'Service Vouchers', href: '/vouchers', icon: Ticket },
            ]
        },
        {
            title: 'BILLING',
            items: [
                { name: 'Client Invoices', href: '/invoices/client', icon: Receipt },
                { name: 'Supplier Invoices', href: '/invoices/supplier', icon: FileSignature },
            ]
        },
        {
            title: 'ADMIN',
            items: [
                { name: 'Finance', href: '/finance', icon: Landmark },
                { name: 'Masters', href: '/masters', icon: Settings },
            ]
        }
    ]

    const isActive = (path) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true
        if (path !== '/dashboard' && pathname.startsWith(path)) return true
        return false
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white border-r border-secondary-200 w-64
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="px-6 py-5 border-b border-secondary-200 flex items-center gap-2">
                        <div className="bg-primary-600 p-1.5 rounded-lg">
                            <span className="text-white font-bold text-lg">VC</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-secondary-900 leading-tight">
                                Volshebny
                            </h1>
                            <p className="text-xs text-secondary-500 font-medium">CRM Suite</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                        {navigation.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <h3 className="px-3 text-[10px] font-bold text-secondary-400 uppercase tracking-wider">
                                    {group.title}
                                </h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        const active = isActive(item.href)
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    className={`
                                                        flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group
                                                        ${active
                                                            ? 'bg-primary-50 text-primary-700'
                                                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'}
                                                    `}
                                                >
                                                    <Icon className={`w-4.5 h-4.5 transition-colors ${active ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}`} />
                                                    <span>{item.name}</span>
                                                    {active && (
                                                        <div className="ml-auto w-1 h-1 rounded-full bg-primary-600"></div>
                                                    )}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-secondary-200 bg-secondary-50/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-semibold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-secondary-900 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-secondary-500 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 ease-in-out`}>
                {/* Header */}
                <header className="bg-white border-b border-secondary-200 sticky top-0 z-30 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-100"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors relative group">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default MainLayout
