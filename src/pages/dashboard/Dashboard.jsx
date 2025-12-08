import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import { getQueryStats } from '@api/query.api'
import { getFinanceDashboard } from '@api/finance.api'

/**
 * Dashboard Page
 */
const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [financeData, setFinanceData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const [queryStatsRes, financeRes] = await Promise.all([
                getQueryStats(),
                getFinanceDashboard(),
            ])
            setStats(queryStatsRes.data)
            setFinanceData(financeRes.data)
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: 'Total Queries',
            value: stats?.totalQueries || 0,
            change: '+12%',
            icon: '📝',
            color: 'bg-blue-500',
        },
        {
            title: 'Confirmed Queries',
            value: stats?.confirmedQueries || 0,
            change: '+8%',
            icon: '✅',
            color: 'bg-green-500',
        },
        {
            title: 'Revenue (MTD)',
            value: `₹${financeData?.monthlyRevenue?.toLocaleString() || 0}`,
            change: '+15%',
            icon: '💰',
            color: 'bg-purple-500',
        },
        {
            title: 'Pending Payments',
            value: `₹${financeData?.pendingPayments?.toLocaleString() || 0}`,
            change: '-5%',
            icon: '⏳',
            color: 'bg-orange-500',
        },
    ]

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Welcome to VolshebnyCRM"
                actions={
                    <Button variant="primary">
                        <Link to="/queries/create">Create New Query</Link>
                    </Button>
                }
            />

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-secondary-600 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold text-secondary-900">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">
                                            {stat.change} from last month
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Queries */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-secondary-900">
                                    Recent Queries
                                </h3>
                                <Link to="/queries" className="text-sm text-primary-600 hover:text-primary-700">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-secondary-900">Query #{1000 + item}</p>
                                            <p className="text-sm text-secondary-600">Client Name - Destination</p>
                                        </div>
                                        <span className="badge badge-info">Pending</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Invoices */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-secondary-900">
                                    Pending Invoices
                                </h3>
                                <Link to="/invoices/client" className="text-sm text-primary-600 hover:text-primary-700">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-secondary-900">INV-{2000 + item}</p>
                                            <p className="text-sm text-secondary-600">Due: Dec {10 + item}, 2024</p>
                                        </div>
                                        <span className="font-semibold text-secondary-900">₹{(50000 + item * 10000).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Dashboard
