import PageHeader from '@components/PageHeader'

const FinanceSummary = () => {
    const stats = [
        { label: 'Total Revenue', value: '₹5,00,000', color: 'bg-green-500' },
        { label: 'Total Expenses', value: '₹3,00,000', color: 'bg-red-500' },
        { label: 'Net Profit', value: '₹2,00,000', color: 'bg-blue-500' },
        { label: 'Outstanding', value: '₹1,00,000', color: 'bg-orange-500' },
    ]

    return (
        <div>
            <PageHeader title="Finance Summary" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance' }]} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card">
                        <p className="text-sm text-secondary-600 mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Financial Reports</h3>
                <p className="text-secondary-600">Detailed financial reports and analytics coming soon...</p>
            </div>
        </div>
    )
}

export default FinanceSummary
